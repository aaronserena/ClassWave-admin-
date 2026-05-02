/**
 * ClassWave — Admin Dashboard Application Logic
 * Supabase Direct Migration (No PHP)
 */

'use strict';

/* ─── Global State ───────────────────────────── */
let schedules = [];
let students  = [];
let admins    = [];
let subjects  = [];
let activeStudentIndex = -1;

/* ─── DOM References ─────────────────────────── */
let sidebar, menuToggle, breadcrumb, toast, toastMsg, toastIcon;
let scheduleTbody, scheduleEmpty, scheduleSearch, filterDay;
let studentTbody, studentEmpty, studentSearch, filterCourse;
let modalOverlay, modalTitle, scheduleForm, editIndex;
let adminModalOverlay, adminForm;
let confirmOverlay, confirmClose, btnConfirmCancel, btnConfirmDelete;
let studentEnrollOverlay, seBtnSave, seBtnCancel, seModalClose;
let enrollmentOverlay, enrollmentClose, btnOpenPicker, enrolledListEl, enrolledEmpty, enrollCountChip, enrollmentStrip, enrollModalTitle, enrollScheduleMeta;
let pickerOverlay, pickerClose, pickerSearch, pickerListEl, pickerEmpty;
let studentModalOverlay, studentModalTitle, studentModalSubtitle, studentModalClose, studentBtnCancel, studentBtnSave, studentForm, studentEditIndex, registryNotice;
let sfName, sfId, sfCourse, sfYear, sfSection, sfStatus;
let fSubject, fInstructor, fRoom, fDay, fTimeStart, fTimeEnd;
let pendingDeleteIndex = null;
let pendingDeleteType  = null;
let activeScheduleIndex = null;
let notifPanel, notifOverlay, notifToggle, notifClose, notifClear;
let notifDetailOverlay, ndTitle, ndTime, ndMessage, ndIcon;
let profileModalOverlay, profileForm, profileToggle, profileModalClose, profileBtnCancel;
let pFullName, pUsername, pPassword;

/* ─── Utility: XSS Guard ─────────────────────── */
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Utility: Debounce ─────────────────────── */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ─── Date/Time ────────────────────────────── */
function setCurrentDate() {
  const dateEl = document.getElementById('current-date');
  if (!dateEl) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-PH', opts);
}

/* ─── Page Navigation ───────────────────────── */
function navigateTo(pageKey) {
  console.log('Navigating to:', pageKey);
  try {
    // Switch active page
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(`page-${pageKey}`);
    if (target) {
      target.classList.add('active');
    } else {
      console.warn('Page not found:', pageKey);
    }

    // Switch active nav item
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(n => {
      n.classList.toggle('active', n.dataset.page === pageKey);
    });

    // Breadcrumb
    const bc = document.getElementById('breadcrumb-text');
    if (bc) {
      const labels = {
        dashboard: 'Dashboard',
        schedule:  'Manage Schedule',
        students:  'Manage Students',
        admins:    'Administrator',
        profile:   'Account Settings',
      };
      bc.textContent = labels[pageKey] || 'Dashboard';
    }

    // Mobile sidebar auto-close
    if (window.innerWidth <= 768 && sidebar) {
      sidebar.classList.remove('open');
    }

    // Trigger specific page logic
    if (pageKey === 'schedule') renderSchedules();
    if (pageKey === 'students') renderStudents();
    if (pageKey === 'admins')   fetchAdmins();
    if (pageKey === 'profile')  prepareProfilePage();
  } catch (err) {
    console.error('Navigation Error:', err);
  }
}

/* ─── Initialization ────────────────────────── */
function initApp() {
  console.log('ClassWave Dashboard: Initializing Core...');

  // 1. Resolve DOM Elements
  sidebar           = document.getElementById('sidebar');
  menuToggle        = document.getElementById('menuToggle');
  breadcrumb        = document.getElementById('breadcrumb-text');
  toast             = document.getElementById('toast');
  toastMsg          = document.getElementById('toast-msg');
  toastIcon         = document.getElementById('toast-icon');
  
  scheduleTbody     = document.getElementById('schedule-tbody');
  scheduleEmpty     = document.getElementById('schedule-empty');
  scheduleSearch    = document.getElementById('schedule-search');
  filterDay         = document.getElementById('filter-day');

  studentTbody      = document.getElementById('student-tbody');
  studentEmpty      = document.getElementById('student-empty');
  studentSearch     = document.getElementById('student-search');
  filterCourse      = document.getElementById('filter-course');

  modalOverlay      = document.getElementById('modal-overlay');
  modalTitle        = document.getElementById('modal-title');
  scheduleForm      = document.getElementById('schedule-form');
  editIndex         = document.getElementById('edit-index');
  adminModalOverlay = document.getElementById('admin-modal-overlay');
  adminForm         = document.getElementById('admin-form');

  confirmOverlay    = document.getElementById('confirm-overlay');
  confirmClose      = document.getElementById('confirm-close');
  btnConfirmCancel  = document.getElementById('btn-confirm-cancel');
  btnConfirmDelete  = document.getElementById('btn-confirm-delete');

  studentEnrollOverlay = document.getElementById('student-enroll-overlay');
  seBtnSave         = document.getElementById('se-btn-save');
  seBtnCancel       = document.getElementById('se-btn-cancel');
  seModalClose      = document.getElementById('se-modal-close');

  enrollmentOverlay = document.getElementById('enrollment-overlay');
  enrollmentClose   = document.getElementById('enrollment-close');
  btnOpenPicker     = document.getElementById('btn-open-picker');
  enrolledListEl    = document.getElementById('enrolled-list');
  enrolledEmpty     = document.getElementById('enrolled-empty');
  enrollCountChip   = document.getElementById('enrollment-count-chip');
  enrollmentStrip   = document.getElementById('enrollment-strip');
  enrollModalTitle  = document.getElementById('enrollment-modal-title');
  enrollScheduleMeta= document.getElementById('enrollment-schedule-meta');

  pickerOverlay     = document.getElementById('picker-overlay');
  pickerClose       = document.getElementById('picker-close');
  pickerSearch      = document.getElementById('picker-search');
  pickerListEl      = document.getElementById('picker-list');
  pickerEmpty       = document.getElementById('picker-empty');

  studentModalOverlay = document.getElementById('student-modal-overlay');
  studentModalTitle   = document.getElementById('student-modal-title');
  studentModalSubtitle= document.getElementById('student-modal-subtitle');
  studentModalClose   = document.getElementById('student-modal-close');
  studentBtnCancel    = document.getElementById('student-btn-cancel');
  studentBtnSave      = document.getElementById('student-btn-save');
  studentForm         = document.getElementById('student-form');
  studentEditIndex    = document.getElementById('student-edit-index');
  registryNotice      = document.getElementById('registry-notice');

  sfName    = document.getElementById('sf-name');
  sfId      = document.getElementById('sf-id');
  sfCourse  = document.getElementById('sf-course');
  sfYear    = document.getElementById('sf-year');
  sfSection = document.getElementById('sf-section');
  sfStatus  = document.getElementById('sf-status');

  fSubject          = document.getElementById('f-subject');
  fInstructor       = document.getElementById('f-instructor');
  fRoom             = document.getElementById('f-room');
  fDay              = document.getElementById('f-day');
  fTimeStart        = document.getElementById('f-time-start');
  fTimeEnd          = document.getElementById('f-time-end');

  notifPanel        = document.getElementById('notifPanel');
  notifOverlay      = document.getElementById('notifOverlay');
  notifToggle       = document.getElementById('notifToggle');
  notifClose        = document.getElementById('notifClose');
  notifClear        = document.getElementById('notifClear');

  notifDetailOverlay = document.getElementById('notif-detail-overlay');
  ndTitle            = document.getElementById('nd-title');
  ndTime             = document.getElementById('nd-time');
  ndMessage          = document.getElementById('nd-message');
  ndIcon             = document.getElementById('nd-icon');

  profileModalOverlay = document.getElementById('profile-modal-overlay');
  profileForm         = document.getElementById('profile-form');
  profileToggle       = document.getElementById('profileToggle');
  profileModalClose   = document.getElementById('profile-modal-close');
  profileBtnCancel    = document.getElementById('profile-btn-cancel');
  pFullName           = document.getElementById('p-fullname');
  pUsername           = document.getElementById('p-username');
  pPassword           = document.getElementById('p-password');

  // 2. Attach Event Listeners
  const bind = (id, event, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
  };

  // Sidebar Toggle
  bind('menuToggle', 'click', () => {
    if (sidebar) sidebar.classList.toggle('open');
  });

  // Navigation (Delegated to Parent for robustness)
  const navParent = document.querySelector('.sidebar-nav');
  if (navParent) {
    navParent.addEventListener('click', e => {
      const item = e.target.closest('.nav-item[data-page]');
      if (item) {
        e.preventDefault();
        navigateTo(item.dataset.page);
      }
    });
  }

  // Dashboard Links
  bind('btn-manage-schedule-dash', 'click', () => navigateTo('schedule'));
  bind('btn-manage-students-dash', 'click', () => navigateTo('students'));
  bind('btn-add-schedule-dash',    'click', () => openAddModal());
  bind('btn-add-schedule',         'click', () => openAddModal());
  bind('btn-add-student',          'click', () => openAddStudentModal());
  bind('btn-add-admin',            'click', () => openAdminModal());

  // Search/Filters
  if (scheduleSearch) {
    scheduleSearch.addEventListener('input', debounce(() => renderSchedules(scheduleSearch.value)));
  }
  bind('filter-day', 'change', () => renderSchedules(scheduleSearch ? scheduleSearch.value : ''));
  
  if (studentSearch) {
    studentSearch.addEventListener('input', debounce(() => renderStudents(studentSearch.value)));
  }
  bind('filter-course', 'change', () => renderStudents(studentSearch ? studentSearch.value : ''));

  if (pickerSearch) {
    pickerSearch.addEventListener('input', debounce(() => renderPickerList(pickerSearch.value)));
  }

  // Modal Closers
  bind('modal-close',       'click', () => closeModal(modalOverlay));
  bind('btn-cancel',        'click', () => closeModal(modalOverlay));
  bind('admin-modal-close', 'click', () => closeModal(adminModalOverlay));
  bind('btn-admin-cancel',  'click', () => closeModal(adminModalOverlay));
  bind('se-modal-close',    'click', () => closeModal(studentEnrollOverlay));
  bind('se-btn-cancel',     'click', () => closeModal(studentEnrollOverlay));
  bind('enrollment-close',  'click', () => closeModal(enrollmentOverlay));
  bind('picker-close',      'click', () => closeModal(pickerOverlay));
  bind('confirm-close',     'click', () => closeModal(confirmOverlay));
  bind('btn-confirm-cancel','click', () => closeModal(confirmOverlay));
  bind('student-modal-close','click',() => closeModal(studentModalOverlay));
  bind('student-btn-cancel', 'click',() => closeModal(studentModalOverlay));

  // Form Submissions / Action Buttons
  if (adminForm)    adminForm.addEventListener('submit', handleAdminSubmit);
  if (scheduleForm) scheduleForm.addEventListener('submit', handleScheduleSubmit);
  if (studentForm)  studentForm.addEventListener('submit', handleStudentSubmit);
  if (seBtnSave)     seBtnSave.addEventListener('click', saveStudentEnrollments);
  if (btnOpenPicker) btnOpenPicker.addEventListener('click', openStudentPicker);
  if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', handleConfirmDelete);

  // Notification Handlers
  bind('notifToggle', 'click', () => {
    notifPanel.classList.add('active');
    notifOverlay.classList.add('active');
  });

  bind('notifClose', 'click', () => {
    notifPanel.classList.remove('active');
    notifOverlay.classList.remove('active');
  });

  bind('notifOverlay', 'click', () => {
    notifPanel.classList.remove('active');
    notifOverlay.classList.remove('active');
  });

  if (notifClear) {
    notifClear.addEventListener('click', () => {
      const listToday = document.getElementById('notif-list-today');
      if (listToday) {
        listToday.innerHTML = `
          <div style="text-align:center; padding:40px 20px; color:var(--gray-400);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:12px; opacity:0.5;">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p>No new notifications</p>
          </div>
        `;
      }
      showToast('Notifications cleared', 'info');
    });
  }

  // Notification Detail Trigger (Event Delegation)
  notifPanel.addEventListener('click', e => {
    const item = e.target.closest('.notif-item');
    if (!item) return;

    // Mark as read
    item.classList.remove('unread');
    
    // Extract data
    const title = item.dataset.title || 'Notification';
    const msg   = item.dataset.msg || 'No details available.';
    const time  = item.dataset.time || '';
    const iconType = item.dataset.icon || 'purple';

    // Populate Modal
    if (ndTitle) ndTitle.textContent = title;
    if (ndTime)  ndTime.textContent  = time;
    if (ndMessage) ndMessage.textContent = msg;
    if (ndIcon) {
      ndIcon.className = `notif-icon icon-${iconType}`;
      ndIcon.innerHTML = item.querySelector('.notif-icon').innerHTML;
    }

    openModal(notifDetailOverlay);
  });

  bind('notif-detail-close', 'click', () => closeModal(notifDetailOverlay));
  bind('nd-btn-close',       'click', () => closeModal(notifDetailOverlay));
  if (notifDetailOverlay) {
    notifDetailOverlay.addEventListener('click', e => {
      if (e.target === notifDetailOverlay) closeModal(notifDetailOverlay);
    });
  }




  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentUsername = localStorage.getItem('classwave_admin_username');
      if (!currentUsername) {
        showToast('Session error. Please re-login.', 'error');
        return;
      }

      const payload = {
        current_username: currentUsername,
        full_name: pFullName.value.trim(),
        username: pUsername.value.trim(),
      };
      if (pPassword.value) payload.password = pPassword.value;

      try {
        const res = await fetch('api/update_profile.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Update failed');
        
        // Update local storage
        localStorage.setItem('classwave_admin_user', payload.full_name);
        localStorage.setItem('classwave_admin_username', data.new_username);
        
        // Update UI
        const avatar = document.getElementById('topbar-avatar');
        if (avatar) avatar.textContent = payload.full_name.charAt(0).toUpperCase();
        
        showToast('Profile updated successfully!', 'success');
        prepareProfilePage(); // Refresh display fields on the page
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Password Strength Meter
  if (pPassword) {
    pPassword.addEventListener('input', () => {
      const val = pPassword.value;
      const wrapper = document.getElementById('password-strength-wrapper');
      const bar = document.getElementById('password-strength-bar');
      const text = document.getElementById('password-strength-text');

      if (!val) {
        if (wrapper) wrapper.style.display = 'none';
        return;
      }

      if (wrapper) wrapper.style.display = 'block';
      let score = 0;
      if (val.length > 6) score++;
      if (val.length > 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = [
        { width: '20%', color: 'var(--red-500)', label: 'Very Weak' },
        { width: '40%', color: 'var(--orange-500)', label: 'Weak' },
        { width: '60%', color: 'var(--yellow-500)', label: 'Fair' },
        { width: '80%', color: 'var(--blue-500)', label: 'Good' },
        { width: '100%', color: 'var(--green-500)', label: 'Strong' }
      ];

      const lv = levels[Math.min(score, 4)];
      if (bar) {
        bar.style.width = lv.width;
        bar.style.background = lv.color;
      }
      if (text) text.textContent = 'Strength: ' + lv.label;
    });
  }

  // 3. Global Logic (Overlay clicks & Escape key)
  const setupOverlayClick = (ov) => {
    if (ov) ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov); });
  };
  [modalOverlay, adminModalOverlay, studentEnrollOverlay, enrollmentOverlay, pickerOverlay, confirmOverlay, studentModalOverlay, profileModalOverlay, notifDetailOverlay].forEach(setupOverlayClick);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (pickerOverlay && !pickerOverlay.classList.contains('hidden')) { closeModal(pickerOverlay); return; }
      if (enrollmentOverlay && !enrollmentOverlay.classList.contains('hidden')) { closeModal(enrollmentOverlay); return; }
      [modalOverlay, adminModalOverlay, studentEnrollOverlay, confirmOverlay, studentModalOverlay, profileModalOverlay, notifDetailOverlay].forEach(ov => {
        if (ov && !ov.classList.contains('hidden')) closeModal(ov);
      });
    }
  });

  document.addEventListener('click', e => {
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });

  // 4. Kickstart
  navigateTo('dashboard');
  setCurrentDate();
  fetchAllData().catch(err => console.error('Data loading issue:', err));

  // Profile Page Init
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }
  initPasswordStrength();

  // ── Profile Modal: open / close ──────────────────────────
  const profileModalOverlayEl = document.getElementById('profile-modal-overlay');
  const profileModalCloseBtn  = document.getElementById('profile-modal-close');
  const profileCancelBtn      = document.getElementById('profile-cancel-btn');
  const profileToggleBtn      = document.getElementById('profileToggle');

  function openProfileModal() {
    if (!profileModalOverlayEl) return;
    profileModalOverlayEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent bg scroll
    // Reset to first tab
    document.querySelectorAll('.profile-nav-item').forEach(b => b.classList.remove('active'));
    const firstBtn = document.querySelector('.profile-nav-item[data-section="account"]');
    if (firstBtn) firstBtn.classList.add('active');
    document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
    const firstSection = document.getElementById('section-account');
    if (firstSection) firstSection.classList.add('active');
    // Populate data
    if (typeof prepareProfilePage === 'function') prepareProfilePage();
    // Restore saved avatar photo
    applyStoredAvatar();
  }

  // ── Avatar Upload Logic ───────────────────────────────────

  /** Apply a saved base64 avatar photo to all avatar elements in the UI */
  function applyStoredAvatar() {
    const savedPhoto = localStorage.getItem('classwave_admin_avatar');
    const avatarImg  = document.getElementById('profile-avatar-img');
    const avatarText = document.getElementById('profile-avatar-text');

    if (savedPhoto) {
      // Modal floating avatar
      if (avatarImg)  { avatarImg.src = savedPhoto; avatarImg.style.display = 'block'; }
      if (avatarText) { avatarText.style.display = 'none'; }

      // Topbar avatar
      const topbarAvatar = document.getElementById('topbar-avatar');
      if (topbarAvatar) {
        topbarAvatar.style.backgroundImage = `url(${savedPhoto})`;
        topbarAvatar.style.backgroundSize  = 'cover';
        topbarAvatar.style.backgroundPosition = 'center';
        topbarAvatar.textContent = '';
      }

      // Sidebar footer avatar
      const sidebarAvatar = document.querySelector('.admin-avatar');
      if (sidebarAvatar) {
        sidebarAvatar.style.backgroundImage = `url(${savedPhoto})`;
        sidebarAvatar.style.backgroundSize  = 'cover';
        sidebarAvatar.style.backgroundPosition = 'center';
        sidebarAvatar.textContent = '';
      }
    } else {
      // No photo — show initials
      if (avatarImg)  { avatarImg.src = ''; avatarImg.style.display = 'none'; }
      if (avatarText) { avatarText.style.display = ''; }
    }
  }

  // Wire the clickable avatar → file input (body-level delegation so it always works)
  const avatarFileInput = document.getElementById('avatar-file-input');

  // Use event delegation on document so it works even if the modal re-renders
  document.addEventListener('click', e => {
    const avatarBtn = e.target.closest('#profile-page-avatar');
    if (!avatarBtn) return;
    e.stopPropagation(); // prevent bubbling to modal backdrop
    if (avatarFileInput) avatarFileInput.click();
  });

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target.result;
        localStorage.setItem('classwave_admin_avatar', dataUrl);
        applyStoredAvatar();
        showToast('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
      // Reset so picking the same file again still triggers change
      avatarFileInput.value = '';
    });
  }

  // Apply on page load (in case user refreshed)
  applyStoredAvatar();


  function closeProfileModal() {
    if (!profileModalOverlayEl) return;
    profileModalOverlayEl.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Open on topbar avatar click
  if (profileToggleBtn) {
    profileToggleBtn.addEventListener('click', openProfileModal);
  }

  // Close on X button
  if (profileModalCloseBtn) {
    profileModalCloseBtn.addEventListener('click', closeProfileModal);
  }

  // Close on Cancel button inside form
  if (profileCancelBtn) {
    profileCancelBtn.addEventListener('click', closeProfileModal);
  }

  // Close when clicking the backdrop (outside the panel)
  if (profileModalOverlayEl) {
    profileModalOverlayEl.addEventListener('click', e => {
      if (e.target === profileModalOverlayEl) closeProfileModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && profileModalOverlayEl && !profileModalOverlayEl.classList.contains('hidden')) {
      closeProfileModal();
    }
  });

  // Internal Profile Shell Navigation (tab switching)
  const profileShellNav = document.querySelector('.profile-shell-nav');
  if (profileShellNav) {
    profileShellNav.addEventListener('click', e => {
      const btn = e.target.closest('.profile-nav-item');
      if (!btn || !btn.dataset.section) return;

      profileShellNav.querySelectorAll('.profile-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(`section-${btn.dataset.section}`);
      if (target) target.classList.add('active');
    });
  }
}

// Ensure init runs
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ─── Global Handlers (Shared) ───────────────── */
window.adminLogout = function(e) {
  if (e) e.preventDefault();
  localStorage.clear();
  window.location.href = 'login.html';
};


function openAddModal() {
  if (modalTitle) modalTitle.textContent = 'Add New Schedule';
  if (scheduleForm) scheduleForm.reset();
  if (editIndex) editIndex.value = '';
  openModal(modalOverlay);
}

function openAdminModal() {
  if (adminForm) adminForm.reset();
  openModal(adminModalOverlay);
}

async function handleAdminSubmit(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('a-fullname')?.value.trim(),
    username:  document.getElementById('a-username')?.value.trim(),
    password:  document.getElementById('a-password')?.value
  };

  try {
    const res = await fetch('api/add_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating admin');
    showToast('Admin added!', 'success');
    closeModal(adminModalOverlay);
    fetchAdmins();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/* ─── Toast Notifications ───────────────────── */
let toastTimer = null;

function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer);

  const icons = {
    success: '✓',
    error:   '✕',
    info:    'i',
    warning: '!',
  };

  toastIcon.textContent = icons[type] || '✓';
  toastMsg.textContent  = message;
  toast.classList.remove('hidden');

  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

/* ─── Schedule Table ────────────────────────── */
function renderSchedules(filter = '') {
  const dayFilter    = filterDay ? filterDay.value : '';
  const searchFilter = filter.toLowerCase().trim();

  let filtered = schedules.filter(s => {
    const matchDay    = !dayFilter    || s.day === dayFilter;
    const matchSearch = !searchFilter ||
      s.subject.toLowerCase().includes(searchFilter)    ||
      s.instructor.toLowerCase().includes(searchFilter) ||
      s.room.toLowerCase().includes(searchFilter);
    return matchDay && matchSearch;
  });

  if (filtered.length === 0) {
    scheduleTbody.innerHTML = '';
    scheduleEmpty.classList.remove('hidden');
    return;
  }

  scheduleEmpty.classList.add('hidden');

  scheduleTbody.innerHTML = filtered.map((s, i) => {
    // Find real index in schedules array for edit/delete/enroll
    const realIndex = schedules.indexOf(s);
    const enrollCount = (s.enrollments || []).length;
    const countClass  = enrollCount === 0 ? 'enrolled-count empty' : 'enrolled-count';
    const countLabel  = enrollCount === 0 ? '—' : `${enrollCount} student${enrollCount !== 1 ? 's' : ''}`;
    return `
      <tr>
        <td style="color:var(--gray-400);font-weight:500;">${i + 1}</td>
        <td><span class="subject-badge">${escHtml(s.subject)}</span></td>
        <td>${escHtml(s.instructor)}</td>
        <td>${escHtml(s.room)}</td>
        <td><span class="day-tag">${escHtml(s.day)}</span></td>
        <td>${formatTime(s.timeStart)} – ${formatTime(s.timeEnd)}</td>
        <td>
          <span class="${countClass}" title="${enrollCount} student(s) enrolled">${countLabel}</span>
        </td>
        <td>
          <button class="tbl-btn tbl-btn-enroll"
                  title="Manage enrollments"
                  onclick="openEnrollmentModal(${realIndex})"
                  aria-label="Manage enrollments for ${escHtml(s.subject)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
          <button class="tbl-btn tbl-btn-edit"
                  title="Edit schedule"
                  onclick="openEditModal(${realIndex})"
                  aria-label="Edit ${escHtml(s.subject)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="tbl-btn tbl-btn-delete"
                  title="Delete schedule"
                  onclick="confirmDelete(${realIndex})"
                  aria-label="Delete ${escHtml(s.subject)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('');
}

/* ─── Student Table ─────────────────────────── */
function renderStudents(filter = '') {
  const courseFilter = filterCourse ? filterCourse.value : '';
  const searchFilter = filter.toLowerCase().trim();

  let filtered = students.filter(s => {
    const matchCourse = !courseFilter || s.course === courseFilter;
    const matchSearch = !searchFilter ||
      s.name.toLowerCase().includes(searchFilter)   ||
      s.course.toLowerCase().includes(searchFilter) ||
      s.id.toLowerCase().includes(searchFilter)     ||
      (s.section || '').toLowerCase().includes(searchFilter);
    return matchCourse && matchSearch;
  });

  if (filtered.length === 0) {
    studentTbody.innerHTML = '';
    studentEmpty.classList.remove('hidden');
    return;
  }

  studentEmpty.classList.add('hidden');

  studentTbody.innerHTML = filtered.map((s, i) => {
    const realIndex = students.indexOf(s);
    return `
    <tr>
      <td style="color:var(--gray-400);font-weight:500;">${i + 1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="
            width:32px;height:32px;border-radius:50%;
            background:var(--purple-100);color:var(--purple-600);
            display:flex;align-items:center;justify-content:center;
            font-weight:700;font-size:12px;flex-shrink:0;">
            ${escHtml(s.name.charAt(0))}
          </div>
          <span style="font-weight:600;color:var(--gray-900);">${escHtml(s.name)}</span>
        </div>
      </td>
      <td style="font-family:monospace;font-size:12.5px;color:var(--gray-500);">${escHtml(s.id)}</td>
      <td><span class="day-tag">${escHtml(s.course)}</span></td>
      <td>${escHtml(s.year)}</td>
      <td>
        <span style="font-size:12.5px;font-weight:600;color:var(--gray-600);">
          Sec. ${escHtml(s.section || '—')}
        </span>
      </td>
      <td>
        <span class="student-status ${s.active ? 's-active' : 's-inactive'}">
          ${s.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <button class="tbl-btn tbl-btn-enroll" title="Enroll in schedules"
                onclick="openStudentEnrollModal(${realIndex})"
                aria-label="Enroll ${escHtml(s.name)} in schedules">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </button>
        <button class="tbl-btn tbl-btn-edit" title="Edit student record"
                onclick="openEditStudentModal(${realIndex})"
                aria-label="Edit ${escHtml(s.name)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="tbl-btn tbl-btn-delete" title="Remove student from registry"
                onclick="confirmDeleteStudent(${realIndex})"
                aria-label="Remove ${escHtml(s.name)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

/* ─── XSS Guard ─────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}



/* ─── Modal: Add / Edit Schedule ───────────── */
function openAddModal() {
  modalTitle.textContent = 'Add Schedule';
  document.getElementById('btn-save').textContent = 'Save Schedule';
  editIndex.value = '';
  scheduleForm.reset();
  clearErrors();
  openModal(modalOverlay);
  fSubject.focus();
}

function openEditModal(index) {
  const s = schedules[index];
  if (!s) return;

  modalTitle.textContent = 'Edit Schedule';
  document.getElementById('btn-save').textContent = 'Update Schedule';
  editIndex.value = index;

  fSubject.value   = s.subject;
  fInstructor.value= s.instructor;
  fRoom.value      = s.room;
  fDay.value       = s.day;
  fTimeStart.value = s.timeStart;
  fTimeEnd.value   = s.timeEnd;

  clearErrors();
  openModal(modalOverlay);
  fSubject.focus();
}

/* Expose to inline onclick */
window.openEditModal = openEditModal;

/* ─── Form Validation ────────────────────────── */
function validateForm() {
  clearErrors();
  let valid = true;

  const subjectVal = (fSubject?.value || '').trim();
  const instrVal   = (fInstructor?.value || '').trim();
  const roomVal    = (fRoom?.value || '').trim();
  const dayVal     = fDay?.value || '';
  const startVal   = (fTimeStart?.value || '').trim();
  const endVal     = (fTimeEnd?.value || '').trim();

  if (!subjectVal) {
    showError('err-subject', 'Subject Name is required.', fSubject);
    valid = false;
  }
  if (!instrVal) {
    showError('err-instructor', 'Instructor is required.', fInstructor);
    valid = false;
  }
  if (!roomVal) {
    showError('err-room', 'Room is required.', fRoom);
    valid = false;
  }
  if (!dayVal) {
    showError('err-day', 'Please select a day.', fDay);
    valid = false;
  }
  if (!startVal) {
    showError('err-time-start', 'Start time is required.', fTimeStart);
    valid = false;
  }
  if (!endVal) {
    showError('err-time-end', 'End time is required.', fTimeEnd);
    valid = false;
  }

  return valid;
}

function showError(errId, msg, inputEl) {
  const errEl = document.getElementById(errId);
  if (errEl) errEl.textContent = msg;
  if (inputEl) inputEl.classList.add('invalid');
}

function clearErrors() {
  ['err-subject','err-instructor','err-room','err-day','err-time-start','err-time-end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  [fSubject, fInstructor, fRoom, fDay, fTimeStart, fTimeEnd].forEach(el => {
    if (el) el.classList.remove('invalid');
  });
}

/* Form submit */
async function handleScheduleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const subjectName = fSubject.value.trim();
  const instructor  = fInstructor.value.trim();
  const room        = fRoom.value.trim();
  const day         = fDay.value;
  const timeStart   = fTimeStart.value.trim();
  const timeEnd     = fTimeEnd.value.trim();

  try {
    // 1. Find or Create Subject
    let subjectId;
    const subjRes = await fetch(`${SUPABASE_URL}/subjects?subject_name=eq.${encodeURIComponent(subjectName)}&instructor=eq.${encodeURIComponent(instructor)}`, { headers: sbHeaders });
    const subjData = await subjRes.json();

    if (subjData.length > 0) {
      subjectId = subjData[0].subject_id;
    } else {
      const newSubjRes = await fetch(`${SUPABASE_URL}/subjects`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify({ subject_name: subjectName, instructor: instructor })
      });
      const newSubjData = await newSubjRes.json();
      
      if (!newSubjRes.ok) {
        throw new Error(`Supabase Error: ${newSubjData.message || 'Check RLS policies'}`);
      }
      
      if (!Array.isArray(newSubjData) || newSubjData.length === 0) {
        throw new Error('Supabase did not return any data. Check your table permissions.');
      }
      
      subjectId = newSubjData[0].subject_id;
    }

    const idx = editIndex.value;
    const scheduleData = {
      subject_id: subjectId,
      room,
      day,
      start_time: timeStart,
      end_time: timeEnd
    };

    if (idx === '') {
      // Add new
      const res = await fetch(`${SUPABASE_URL}/schedules`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify(scheduleData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Schedule Error: ${data.message || 'Check Supabase RLS'}`);
      showToast('Schedule added successfully!', 'success');
    } else {
      // Edit existing
      const existing = schedules[parseInt(idx, 10)];
      const res = await fetch(`${SUPABASE_URL}/schedules?schedule_id=eq.${existing.id}`, {
        method: 'PATCH',
        headers: sbHeaders,
        body: JSON.stringify(scheduleData)
      });
      if (!res.ok) throw new Error('Failed to update schedule');
      showToast('Schedule updated successfully!', 'success');
    }

    closeModal(modalOverlay);
    fetchAllData();
  } catch (error) {
    console.error('Submit Error Details:', error);
    // If it's the strange Safari pattern error, let's give more context
    const msg = error.message === 'The string did not match the expected pattern' 
      ? 'Browser Validation Error: Check your input formats.' 
      : error.message;
    showToast(msg, 'error');
  }
}

/* Modal close handlers */
modalClose.addEventListener('click', () => closeModal(modalOverlay));
btnCancel.addEventListener('click',  () => closeModal(modalOverlay));

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal(modalOverlay);
});

async function handleConfirmDelete() {
  if (pendingDeleteIndex === null) return;

  try {
    if (pendingDeleteType === 'student') {
      const removed = students[pendingDeleteIndex];
      students.splice(pendingDeleteIndex, 1);
      renderStudents(studentSearch ? studentSearch.value : '');
      showToast(`${removed ? removed.name : 'Student'} removed from registry.`, 'info');
    } else {
      const sched = schedules[pendingDeleteIndex];
      const res = await fetch('api/delete_schedule.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sched.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete schedule');

      showToast('Schedule deleted.', 'info');
      fetchAllData();
    }
  } catch (error) {
    console.error('Delete Error:', error);
    showToast(error.message, 'error');
  }

  pendingDeleteIndex = null;
  pendingDeleteType  = null;
  closeModal(confirmOverlay);
}

/* ─── Modal open / close helpers ─────────────── */
function openModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

window.openModal = openModal;
window.closeModal = closeModal;

/* Escape key closes modals */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modalOverlay.classList.contains('hidden'))   closeModal(modalOverlay);
    if (!confirmOverlay.classList.contains('hidden')) closeModal(confirmOverlay);
  }
});

/* ─── Enrollment Management ─────────────────── */
function confirmDelete(index) {
  pendingDeleteIndex = index;
  pendingDeleteType  = 'schedule';
  openModal(confirmOverlay);
}
window.confirmDelete = confirmDelete;

function confirmDeleteStudent(index) {
  pendingDeleteIndex = index;
  pendingDeleteType  = 'student';
  openModal(confirmOverlay);
}
window.confirmDeleteStudent = confirmDeleteStudent;


/**
 * Open the Enrollment Management modal for a given schedule index.
 */
function openEnrollmentModal(scheduleIndex) {
  activeScheduleIndex = scheduleIndex;
  const s = schedules[scheduleIndex];

  // Set modal header
  enrollModalTitle.textContent  = s.subject;
  enrollScheduleMeta.textContent = `${s.day} · ${formatTime(s.timeStart)} – ${formatTime(s.timeEnd)} · ${s.room}`;

  // Build the info strip
  enrollmentStrip.innerHTML = `
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      ${escHtml(s.day)}
    </span>
    <span class="strip-divider"></span>
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      ${formatTime(s.timeStart)} – ${formatTime(s.timeEnd)}
    </span>
    <span class="strip-divider"></span>
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      ${escHtml(s.room)}
    </span>
    <span class="strip-divider"></span>
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      ${escHtml(s.instructor)}
    </span>`;

  renderEnrolledList();
  openModal(enrollmentOverlay);
}

/* Expose to inline onclick */
window.openEnrollmentModal = openEnrollmentModal;

/**
 * Render the list of enrolled students inside the enrollment modal.
 */
function renderEnrolledList() {
  const s = schedules[activeScheduleIndex];
  if (!s.enrollments) s.enrollments = [];

  const enrolledStudents = students.filter(st => s.enrollments.includes(st.id));

  // Update count chip
  const count = enrolledStudents.length;
  enrollCountChip.textContent = `${count} student${count !== 1 ? 's' : ''}`;

  if (count === 0) {
    enrolledListEl.innerHTML = '';
    enrolledEmpty.classList.remove('hidden');
    return;
  }

  enrolledEmpty.classList.add('hidden');
  enrolledListEl.innerHTML = enrolledStudents.map(st => `
    <div class="enrolled-item">
      <div class="enrolled-avatar">${escHtml(st.name.charAt(0))}</div>
      <div class="enrolled-info">
        <span class="enrolled-name">${escHtml(st.name)}</span>
        <span class="enrolled-meta">${escHtml(st.id)} · ${escHtml(st.course)} · ${escHtml(st.year)}</span>
      </div>
      <button class="tbl-btn tbl-btn-delete"
              title="Remove from schedule"
              onclick="unenrollStudent('${escHtml(st.id)}')"
              aria-label="Remove ${escHtml(st.name)} from schedule">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');
}

/**
 * Remove a student from the active schedule's enrollment list.
 */
async function unenrollStudent(studentId) {
  const s = schedules[activeScheduleIndex];
  const student = students.find(st => st.id === studentId);
  
  try {
    const res = await fetch('api/unenroll_student.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule_id: s.id, student_id: studentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to unenroll');

    showToast(`${student ? student.name : 'Student'} removed from schedule.`, 'info');
    fetchAllData(); // Refresh current state
    setTimeout(() => renderEnrolledList(), 200); // Re-render local list
  } catch (error) {
    console.error('Unenroll Error:', error);
    showToast(error.message, 'error');
  }
}

/* Expose to inline onclick */
window.unenrollStudent = unenrollStudent;

/* Enrollment modal close logic is in initApp */

/* ─── Student Picker ─────────────────────────── */

/**
 * Open the student picker sub-modal.
 */
function openStudentPicker() {
  if (pickerSearch) pickerSearch.value = '';
  renderPickerList('');
  openModal(pickerOverlay);
  setTimeout(() => pickerSearch && pickerSearch.focus(), 80);
}

/**
 * Render the list of students available to enroll (not already enrolled).
 */
function renderPickerList(filter) {
  const s = schedules[activeScheduleIndex];
  const enrolledIds  = s.enrollments || [];
  const searchVal    = (filter || '').toLowerCase().trim();

  const available = students.filter(st => {
    const notEnrolled = !enrolledIds.includes(st.id);
    const matchSearch = !searchVal ||
      st.name.toLowerCase().includes(searchVal)   ||
      st.id.toLowerCase().includes(searchVal)     ||
      st.course.toLowerCase().includes(searchVal);
    return notEnrolled && matchSearch;
  });

  if (available.length === 0) {
    pickerListEl.innerHTML = '';
    pickerEmpty.classList.remove('hidden');
    return;
  }

  pickerEmpty.classList.add('hidden');
  pickerListEl.innerHTML = available.map(st => `
    <div class="picker-item" onclick="enrollStudent('${escHtml(st.id)}')" role="button" tabindex="0"
         aria-label="Enroll ${escHtml(st.name)}">
      <div class="enrolled-avatar">${escHtml(st.name.charAt(0))}</div>
      <div class="enrolled-info">
        <span class="enrolled-name">${escHtml(st.name)}</span>
        <span class="enrolled-meta">${escHtml(st.id)} · ${escHtml(st.course)} · ${escHtml(st.year)}</span>
      </div>
      <button class="btn-enroll-pick" tabindex="-1">+ Enroll</button>
    </div>`).join('');

  // Keyboard support for picker items
  pickerListEl.querySelectorAll('.picker-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

/**
 * Enroll a student into the active schedule.
 */
async function enrollStudent(studentId) {
  const s = schedules[activeScheduleIndex];
  const student = students.find(st => st.id === studentId);

  try {
    const res = await fetch('api/enroll_student.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule_id: s.id, student_id: studentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to enroll');

    showToast(`${student ? student.name : 'Student'} enrolled successfully!`, 'success');
    fetchAllData();
    setTimeout(() => {
      renderPickerList(pickerSearch ? pickerSearch.value : '');
      renderEnrolledList();
    }, 200);
  } catch (error) {
    console.error('Enroll Error:', error);
    showToast(error.message, 'error');
  }
}

/* Expose to inline onclick */
window.enrollStudent = enrollStudent;

/* "Enroll Student" button inside enrollment modal */
btnOpenPicker.addEventListener('click', openStudentPicker);

/* Picker search and escape logic are in initApp */

/* ─── Student CRUD Modal ─────────────────────── */
/* Registration button logic moved to initApp */


/**
 * Open the Add Student modal (fresh form).
 */
function openAddStudentModal() {
  studentModalTitle.textContent    = 'Add Student';
  studentModalSubtitle.textContent = 'Register a new student to the school-wide registry.';
  studentBtnSave.textContent       = 'Register Student';
  studentEditIndex.value           = '';
  studentForm.reset();
  clearStudentErrors();

  // Show registry notice, ID field is editable in add mode
  registryNotice.classList.remove('hidden');
  sfId.removeAttribute('readonly');
  sfId.style.cursor = '';

  openModal(studentModalOverlay);
  setTimeout(() => sfName.focus(), 80);
}

/**
 * Open the Edit Student modal — ID is locked (permanent).
 * Admin can update: Name, Course, Year, Section, Status.
 */
function openEditStudentModal(index) {
  const s = students[index];
  if (!s) return;

  studentModalTitle.textContent    = 'Edit Student';
  studentModalSubtitle.textContent = `Updating record for ${s.name}. Student ID cannot be changed.`;
  studentBtnSave.textContent       = 'Save Changes';
  studentEditIndex.value           = index;

  sfName.value    = s.name;
  sfId.value      = s.id;
  sfCourse.value  = s.course;
  sfYear.value    = s.year;
  sfSection.value = s.section || '';
  sfStatus.value  = s.active ? 'active' : 'inactive';

  // Hide notice, lock Student ID — it is permanent
  registryNotice.classList.add('hidden');
  sfId.setAttribute('readonly', true);

  clearStudentErrors();
  openModal(studentModalOverlay);
  setTimeout(() => sfName.focus(), 80);
}

/* Expose to inline onclick */
window.openEditStudentModal = openEditStudentModal;

/**
 * Validate the student form fields.
 * Returns true if all fields are valid.
 */
function validateStudentForm(isEdit) {
  let valid = true;
  clearStudentErrors();

  if (!sfName.value.trim()) {
    showError('err-sf-name', 'Full name is required.', sfName);
    valid = false;
  }

  if (!isEdit) {
    // Validate Student ID only on Add
    const rawId = sfId.value.trim();
    if (!rawId) {
      showError('err-sf-id', 'Student ID is required.', sfId);
      valid = false;
    } else if (!/^\d{4}-\d{4,}$/.test(rawId)) {
      showError('err-sf-id', 'Format must be YYYY-NNNN (e.g. 2024-0001).', sfId);
      valid = false;
    } else if (students.some(s => s.id === rawId)) {
      showError('err-sf-id', 'This Student ID is already registered in the system.', sfId);
      valid = false;
    }
  }

  if (!sfCourse.value) {
    showError('err-sf-course', 'Please select a course/program.', sfCourse);
    valid = false;
  }

  if (!sfYear.value) {
    showError('err-sf-year', 'Please select a year level.', sfYear);
    valid = false;
  }

  if (!sfSection.value.trim()) {
    showError('err-sf-section', 'Section is required.', sfSection);
    valid = false;
  }

  return valid;
}

function clearStudentErrors() {
  ['err-sf-name','err-sf-id','err-sf-course','err-sf-year','err-sf-section'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  [sfName, sfId, sfCourse, sfYear, sfSection].forEach(el => {
    if (el) el.classList.remove('invalid');
  });
}

async function handleStudentSubmit(e) {
  e.preventDefault();
  const isEdit = studentEditIndex.value !== '';
  if (!validateStudentForm(isEdit)) return;

  const studentData = {
    name:    sfName.value.trim(),
    id:      sfId.value.trim(),
    course:  sfCourse.value,
    year:    sfYear.value,
    section: sfSection.value.trim(),
    active:  isEdit ? (sfStatus.value === 'active') : true,
  };

  try {
    const res = await fetch('api/add_student.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to register student');

    showToast(isEdit ? `${studentData.name}'s record updated!` : `${studentData.name} registered successfully!`, 'success');
    
    closeModal(studentModalOverlay);
    fetchAllData(); 
  } catch (error) {
    console.error('Student Submit Error:', error);
    showToast(error.message, 'error');
  }
}

/* Student modal close logic is in initApp */

/* ─── Student-Centric Enrollment (Schedule Checklist) ───── */


/**
 * Open the student-centric enrollment modal.
 * Shows all schedules as a checkbox list — pre-checked if already enrolled.
 */
function openStudentEnrollModal(studentIndex) {
  activeStudentIndex = studentIndex;
  const st = students[studentIndex];

  document.getElementById('se-modal-title').textContent = st.name;
  document.getElementById('se-modal-meta').textContent =
    `${st.id} · ${st.course} · ${st.year} · Sec. ${st.section || '—'}`;

  // Build the student info strip
  document.getElementById('se-strip').innerHTML = `
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
      ${escHtml(st.course)}
    </span>
    <span class="strip-divider"></span>
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      ${escHtml(st.year)}
    </span>
    <span class="strip-divider"></span>
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
      Sec. ${escHtml(st.section || '—')}
    </span>
    <span class="strip-divider"></span>
    <span class="strip-item">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      ID: ${escHtml(st.id)}
    </span>`;

  renderScheduleChecklist(st.id);
  openModal(studentEnrollOverlay);
}

/* Expose to inline onclick in student table */
window.openStudentEnrollModal = openStudentEnrollModal;

/**
 * Render all schedules as a checkbox list, grouped by day.
 * Pre-checks schedules the student is already enrolled in.
 */
function renderScheduleChecklist(studentId) {
  const checklistEl = document.getElementById('se-checklist');
  const seEmpty     = document.getElementById('se-empty');

  if (schedules.length === 0) {
    checklistEl.innerHTML = '';
    seEmpty.classList.remove('hidden');
    return;
  }

  seEmpty.classList.add('hidden');

  const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Group schedules by day, preserving real index
  const grouped = {};
  schedules.forEach((s, idx) => {
    if (!grouped[s.day]) grouped[s.day] = [];
    grouped[s.day].push({ s, idx });
  });

  checklistEl.innerHTML = dayOrder
    .filter(day => grouped[day])
    .map(day => `
      <div class="se-day-label">${day}</div>
      ${grouped[day].map(({ s, idx }) => {
        const isChecked = (s.enrollments || []).includes(studentId);
        return `
          <div class="se-check-item ${isChecked ? 'checked' : ''}"
               data-schedule-idx="${idx}"
               onclick="toggleScheduleCheck(this)"
               role="checkbox"
               aria-checked="${isChecked}"
               tabindex="0"
               aria-label="${escHtml(s.subject)}">
            <div class="se-checkbox">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="se-schedule-info">
              <div class="se-subject">${escHtml(s.subject)}</div>
              <div class="se-schedule-details">
                ${escHtml(s.room)} &middot; ${formatTime(s.timeStart)} – ${formatTime(s.timeEnd)} &middot; ${escHtml(s.instructor)}
              </div>
            </div>
            ${isChecked ? '<span class="se-enrolled-tag">Enrolled</span>' : ''}
          </div>`;
      }).join('')}`)
    .join('');

  // Keyboard support
  checklistEl.querySelectorAll('.se-check-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleScheduleCheck(item);
      }
    });
  });
}

/**
 * Toggle the checked state of a schedule item in the checklist.
 */
function toggleScheduleCheck(el) {
  const isNowChecked = !el.classList.contains('checked');
  el.classList.toggle('checked', isNowChecked);
  el.setAttribute('aria-checked', isNowChecked);

  // Add / remove the "Enrolled" badge live
  const existingTag = el.querySelector('.se-enrolled-tag');
  if (isNowChecked && !existingTag) {
    el.insertAdjacentHTML('beforeend', '<span class="se-enrolled-tag">Enrolled</span>');
  } else if (!isNowChecked && existingTag) {
    existingTag.remove();
  }
}

/* Expose to inline onclick */
window.toggleScheduleCheck = toggleScheduleCheck;

/**
 * Save all checked/unchecked states back to the schedules array.
 * Processes ALL schedule rows in one shot via API calls.
 */
async function saveStudentEnrollments() {
  const st = students[activeStudentIndex];
  const items = document.querySelectorAll('#se-checklist .se-check-item');
  const enrollmentPromises = [];
  
  let enrollCount = 0;
  let removeCount = 0;

  items.forEach(item => {
    const schedIdx = parseInt(item.dataset.scheduleIdx, 10);
    const s = schedules[schedIdx];
    if (!s) return;
    if (!s.enrollments) s.enrollments = [];

    const isChecked   = item.classList.contains('checked');
    const wasEnrolled = s.enrollments.includes(st.id);

    if (isChecked && !wasEnrolled) {
      enrollmentPromises.push(
        fetch('api/enroll_student.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: s.id, student_id: st.id })
        })
      );
      enrollCount++;
    } else if (!isChecked && wasEnrolled) {
      enrollmentPromises.push(
        fetch('api/unenroll_student.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule_id: s.id, student_id: st.id })
        })
      );
      removeCount++;
    }
  });

    try {
      if (enrollmentPromises.length > 0) {
        const results = await Promise.all(enrollmentPromises);
        for (const res of results) {
          if (!res.ok) throw new Error('One or more enrollment updates failed');
        }
      }

      closeModal(studentEnrollOverlay);
      fetchAllData(); // Refresh global state

      const parts = [];
      if (enrollCount > 0) parts.push(`enrolled in ${enrollCount} schedule${enrollCount !== 1 ? 's' : ''}`);
      if (removeCount > 0) parts.push(`removed from ${removeCount} schedule${removeCount !== 1 ? 's' : ''}`);

      if (parts.length > 0) {
        showToast(`${st.name} ${parts.join(' & ')}!`, 'success');
      } else {
        showToast('No changes made.', 'info');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
}

/* ─── Admin Management ───────────────────────── */
async function fetchAdmins() {
  try {
    const res = await fetch('api/get_users.php');
    if (!res.ok) throw new Error('Failed to fetch admins');
    admins = await res.json();
    renderAdmins();
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    admins = [];
    renderAdmins();
  }
}

function renderAdmins() {
  const tbody = document.getElementById('admin-tbody');
  const empty = document.getElementById('admin-empty');
  if (!tbody) return;

  if (admins.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  tbody.innerHTML = admins.map((a, i) => {
    const isSuper = a.role === 'super_admin';
    const roleBadge = isSuper ? '<span class="status-badge s-active">Super Admin</span>' : '<span class="status-badge s-inactive">Admin</span>';
    const deleteBtn = isSuper ? '' : `
      <button class="tbl-btn tbl-btn-delete" title="Delete Admin" onclick="deleteAdmin(${a.user_id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>`;

    return `
      <tr>
        <td style="color:var(--gray-400);font-weight:500;">${i + 1}</td>
        <td><span style="font-weight:600;color:var(--gray-900);">${escHtml(a.full_name)}</span></td>
        <td><span style="font-family:monospace;font-size:12.5px;color:var(--gray-500);">${escHtml(a.username)}</span></td>
        <td>${roleBadge}</td>
        <td>${deleteBtn}</td>
      </tr>`;
  }).join('');
}

function openAdminModal() {
  if (adminForm) adminForm.reset();
  openModal(adminModalOverlay);
}

async function deleteAdmin(userId) {
  if (!confirm('Are you sure you want to delete this admin account?')) return;
  
  try {
    const res = await fetch('api/delete_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete admin');

    showToast('Admin deleted.', 'info');
    fetchAdmins();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

window.deleteAdmin = deleteAdmin;

/* ─── Supabase Integration ─────────────────── */

async function fetchAllData() {
  try {
    const [schedRes, studRes, subjRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/schedules`, { headers: sbHeaders }),
      fetch(`${SUPABASE_URL}/students`, { headers: sbHeaders }),
      fetch(`${SUPABASE_URL}/subjects`, { headers: sbHeaders })
    ]);

    if (!schedRes.ok || !studRes.ok || !subjRes.ok) {
      const errData = await (schedRes.ok ? (studRes.ok ? subjRes : studRes) : schedRes).json();
      throw new Error(errData.message || 'Supabase Connection Error');
    }

    const rawSchedules = await schedRes.json();
    students = await studRes.json();
    subjects = await subjRes.json();

    // Join subjects to schedules in memory
    schedules = rawSchedules.map(s => {
      const subj = subjects.find(sub => sub.subject_id === s.subject_id);
      return {
        id: s.schedule_id,
        subject: subj ? subj.subject_name : 'Unknown',
        instructor: subj ? subj.instructor : 'N/A',
        room: s.room,
        day: s.day,
        timeStart: s.start_time,
        timeEnd: s.end_time,
        subject_id: s.subject_id
      };
    });

    renderSchedules();
    renderStudents();
    updateStats();
    renderTodayClasses();
    setCurrentDate();
    fetchAdmins();
  } catch (error) {
    console.error('Supabase Error:', error);
    showToast('Failed to connect to Supabase.', 'error');
  }
}

async function fetchAdmins() {
  try {
    const res = await fetch(`${SUPABASE_URL}/users`, { headers: sbHeaders });
    if (!res.ok) throw new Error('Failed to fetch admins');
    admins = await res.json();
    renderAdmins();
  } catch (error) {
    console.error('Fetch Admins Error:', error);
  }
}

/**
 * Update the dashboard statistic cards.
 */
function updateStats() {
  const statSubjects = document.getElementById('stat-total-subjects');
  const statStudents = document.getElementById('stat-total-students');
  const statSchedules = document.getElementById('stat-total-schedules');
  const statToday    = document.getElementById('stat-today-classes');

  if (statSubjects) {
    const uniqueSubjects = new Set(schedules.map(s => s.subject));
    statSubjects.textContent = uniqueSubjects.size;
  }
  if (statStudents) {
    statStudents.textContent = students.length;
  }
  if (statSchedules) {
    statSchedules.textContent = schedules.length;
  }

  // Calculate today's classes
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = days[new Date().getDay()];
  if (statToday) {
    const todayCount = schedules.filter(s => s.day === today).length;
    statToday.textContent = todayCount;
  }
}

/**
 * Render today's classes list on the dashboard.
 */
function renderTodayClasses() {
  const container = document.getElementById('today-classes-list');
  if (!container) return;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = days[new Date().getDay()];
  const todaySchedules = schedules.filter(s => s.day === today);

  if (todaySchedules.length === 0) {
    container.innerHTML = `
      <div class="table-empty">
        <p>No classes scheduled for ${today}.</p>
      </div>`;
    return;
  }

  // Sort by start time
  todaySchedules.sort((a, b) => a.timeStart.localeCompare(b.timeStart));

  container.innerHTML = todaySchedules.map(s => {
    const now = new Date();
    const curTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    let status = 'Upcoming';
    let statusClass = 'status-upcoming';
    
    if (curTime >= s.timeStart && curTime <= s.timeEnd) {
      status = 'Live';
      statusClass = 'status-active';
    } else if (curTime > s.timeEnd) {
      status = 'Done';
      statusClass = 'status-inactive';
    } else {
      status = formatTime(s.timeStart);
    }

    return `
      <div class="class-item">
        <div class="class-dot" style="background:var(--primary-500)"></div>
        <div class="class-details">
          <span class="class-subject">${escHtml(s.subject)}</span>
          <span class="class-meta">${escHtml(s.room)} · ${formatTime(s.timeStart)} – ${formatTime(s.timeEnd)}</span>
        </div>
        <span class="class-status ${statusClass}">${status}</span>
      </div>`;
  }).join('');
}

/**
 * Prepare the Profile Page with current data from local storage
 */
/**
 * Prepare the Profile Page with current data from local storage
 */
function prepareProfilePage() {
  const name = localStorage.getItem('classwave_admin_user') || 'Admin User';
  const user = localStorage.getItem('classwave_admin_username') || 'admin';
  const role = localStorage.getItem('classwave_admin_role') || 'Super Admin';

  if (pFullName) pFullName.value = name;
  if (pUsername) pUsername.value = user;
  if (pPassword) pPassword.value = '';

  const dispName   = document.getElementById('profile-display-name');
  const dispRole   = document.getElementById('profile-display-role-stat');
  const dispAvatar = document.getElementById('profile-page-avatar');

  if (dispName) dispName.textContent = name;
  if (dispRole) dispRole.textContent = role;
  if (dispAvatar) dispAvatar.textContent = name.charAt(0).toUpperCase();
}

/**
 * Handle Profile Form Submission
 */
async function handleProfileSubmit(e) {
  e.preventDefault();
  
  const newName = pFullName.value.trim();
  const newUser = pUsername.value.trim();
  const newPass = pPassword.value;

  if (!newName || !newUser) {
    showToast('Name and Username are required', 'error');
    return;
  }

  // Simulate API delay
  showToast('Updating profile...', 'info');
  await new Promise(r => setTimeout(r, 1000));

  localStorage.setItem('classwave_admin_user', newName);
  localStorage.setItem('classwave_admin_username', newUser);
  
  // Update UI immediately
  const topName = document.querySelector('.admin-name');
  const topAvatar = document.getElementById('topbar-avatar');
  const sideAvatar = document.querySelector('.admin-avatar');
  
  if (topName) topName.textContent = newName;
  if (topAvatar) topAvatar.textContent = newName.charAt(0).toUpperCase();
  if (sideAvatar) sideAvatar.textContent = newName.charAt(0).toUpperCase();

  prepareProfilePage();
  showToast('Profile updated successfully!', 'success');
  
  // Clear password field
  pPassword.value = '';
  document.getElementById('password-strength-wrapper').style.display = 'none';
}

/**
 * Password Strength Meter Logic
 */
function initPasswordStrength() {
  if (!pPassword) return;
  
  const wrapper = document.getElementById('password-strength-wrapper');
  const bar = document.getElementById('password-strength-bar');
  const text = document.getElementById('password-strength-text');

  pPassword.addEventListener('input', () => {
    const val = pPassword.value;
    if (val.length === 0) {
      wrapper.style.display = 'none';
      return;
    }

    wrapper.style.display = 'block';
    let strength = 0;
    if (val.length > 5) strength += 25;
    if (val.length > 8) strength += 25;
    if (/[A-Z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val)) strength += 25;

    bar.style.width = strength + '%';
    
    if (strength <= 25) {
      bar.style.background = 'var(--red-500)';
      text.textContent = 'Strength: Weak';
      text.style.color = 'var(--red-500)';
    } else if (strength <= 50) {
      bar.style.background = 'var(--orange-500)';
      text.textContent = 'Strength: Fair';
      text.style.color = 'var(--orange-500)';
    } else if (strength <= 75) {
      bar.style.background = 'var(--blue-500)';
      text.textContent = 'Strength: Good';
      text.style.color = 'var(--blue-500)';
    } else {
      bar.style.background = 'var(--green-500)';
      text.textContent = 'Strength: Strong';
      text.style.color = 'var(--green-500)';
    }
  });
}

/* Expose to global */
window.prepareProfilePage = prepareProfilePage;
window.navigateTo = navigateTo;
