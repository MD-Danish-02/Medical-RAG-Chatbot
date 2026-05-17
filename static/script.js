$(document).ready(function() {

            let bookmarks = JSON.parse(localStorage.getItem('med_bookmarks') || '[]');
            let chatHistory = JSON.parse(localStorage.getItem('med_history') || '[]');
            let currentSessionId = Date.now();
            let sidebarOpen = false;

            renderHistory();
            updateBadge();

            $('#text').on('input', function() {
                $('#char-count').text($(this).val().length + ' / 500');
            });

            // ── Send ──
            function sendMessage() {
                const raw = $('#text').val().trim();
                if (!raw) return;
                appendUserMsg(raw);
                $('#text').val('');
                $('#char-count').text('0 / 500');
                scrollBottom();

                $('#chat-box').append(`
        <div class="msg-row" id="typing-row">
          <div class="bot-avatar">📖</div>
          <div class="msg-content">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>`);
                scrollBottom();

                $.ajax({ data: { msg: raw }, type: 'POST', url: '/get' })
                    .done(function(data) {
                        $('#typing-row').remove();
                        const msgId = 'msg' + Date.now();
                        appendBotMsg(data, msgId);
                        saveHistory(raw, msgId);
                        scrollBottom();
                    })
                    .fail(function() {
                        $('#typing-row').remove();
                        appendBotMsg('⚠️ Something went wrong. Please try again.');
                        scrollBottom();
                    });
            }

            $('#send').click(sendMessage);
            $('#text').keypress(function(e) { if (e.which === 13) sendMessage(); });

            function appendUserMsg(text) {
                $('#chat-box').append(`
        <div class="msg-row user-row">
          <div class="msg-content">
            <div class="message user">${escHtml(text)}</div>
          </div>
        </div>`);
            }

            function appendBotMsg(text, msgId) {
                const id = msgId || ('msg' + Date.now());
                const related = getRelated(text);
                const relHtml = related.length ?
                    `<div class="related-topics">${related.map(t => `<span class="related-chip" onclick="askTopic('${t}')">📖 ${t}</span>`).join('')}</div>`
        : '';
      $('#chat-box').append(`
        <div class="msg-row" id="${id}">
          <div class="bot-avatar">📖</div>
          <div class="msg-content">
            <div class="message bot">${text}</div>
            ${relHtml}
            <div class="msg-actions">
              <button class="msg-action-btn" onclick="copyMsg('${id}')">📋 Copy</button>
              <button class="msg-action-btn" onclick="bookmarkMsg('${id}')">🔖 Save</button>
              <button class="msg-action-btn" onclick="speakMsg('${id}')">🔊 Listen</button>
            </div>
          </div>
        </div>`);
    }
  
    window.copyMsg = function (id) {
      const text = $('#' + id + ' .message.bot').text();
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, 99999);
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(ok ? '✅ Copied!' : '❌ Copy failed');
      } catch(e) {
        showToast('❌ Copy not supported');
      }
    };
  
    window.bookmarkMsg = function (id) {
      const t = $('#' + id + ' .message.bot').text();
      bookmarks.unshift({ id: Date.now(), text: t });
      localStorage.setItem('med_bookmarks', JSON.stringify(bookmarks));
      updateBadge();
      showToast('🔖 Saved to bookmarks!');
    };
  
    window.speakMsg = function (id) {
      const t = $('#' + id + ' .message.bot').text();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(t);
        u.rate = 0.92;
        window.speechSynthesis.speak(u);
        showToast('🔊 Reading aloud...');
      } else {
        showToast('❌ TTS not supported');
      }
    };
  
    window.selectCategory = function (el, query) {
      document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      if (query === 'All medical topics') {
        $('#text').val('');
        $('#char-count').text('0 / 500');
      } else {
        $('#text').val(query);
        $('#char-count').text(query.length + ' / 500');
      }
      $('#text').focus();
    };
  
    window.askTopic = function (topic) {
      $('#text').val(topic);
      $('#char-count').text(topic.length + ' / 500');
      $('#text').focus();
    };
  
    function getRelated(text) {
      const map = {
        'allerg': ['Asthma', 'Eczema', 'Anaphylaxis'],
        'diabet': ['Insulin', 'Hypoglycemia', 'Kidney Disease'],
        'fever':  ['Infection', 'Malaria', 'Typhoid'],
        'heart':  ['Hypertension', 'Angina', 'Cholesterol'],
        'asthma': ['COPD', 'Bronchitis', 'Allergy'],
        'headach':['Migraine', 'Hypertension', 'Meningitis'],
        'cancer': ['Chemotherapy', 'Biopsy', 'Tumor'],
        'fractur':['Bone Density', 'Calcium', 'X-Ray'],
      };
      const lower = text.toLowerCase();
      for (const [k, v] of Object.entries(map)) {
        if (lower.includes(k)) return v;
      }
      return [];
    }
  
    function saveHistory(q, msgId) {
      chatHistory.unshift({ id: currentSessionId, q, msgId });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(0, 20);
      localStorage.setItem('med_history', JSON.stringify(chatHistory));
      renderHistory();
    }
  
    function renderHistory() {
      if (!chatHistory.length) {
        $('#history-list').html('<div class="empty-state">No chats yet</div>');
        return;
      }
      $('#history-list').html(chatHistory.map(e => `
        <div class="history-item ${e.id === currentSessionId ? 'active' : ''}" data-msgid="${e.msgId || ''}" data-id="${e.id}">
          <span>💬</span>
          <span class="hi-text" title="${escHtml(e.q)}">${escHtml(e.q.substring(0, 26))}${e.q.length > 26 ? '…' : ''}</span>
          <button class="hi-del-btn" onclick="deleteHistory(${e.id}, event)" title="Delete">✕</button>
        </div>`).join(''));
  
      // Click to jump to that message in chat
      $('#history-list .history-item').on('click', function () {
        const msgId = $(this).data('msgid');
        const target = $('#' + msgId);
        if (target.length) {
          target[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight briefly
          target.find('.message').css('outline', '2px solid var(--primary)');
          setTimeout(() => target.find('.message').css('outline', ''), 1500);
          showToast('📍 Jumped to message');
        } else {
          showToast('⚠️ Message not found in current chat');
        }
      });
    }
  
    window.deleteHistory = function (id, event) {
      event.stopPropagation(); // prevent jump on delete click
      chatHistory = chatHistory.filter(e => e.id !== id);
      localStorage.setItem('med_history', JSON.stringify(chatHistory));
      renderHistory();
      showToast('🗑️ Deleted from history');
    };
  
    window.newChat = function () {
      currentSessionId = Date.now();
      $('#chat-box').html(`
        <div class="msg-row">
          <div class="bot-avatar">📖</div>
          <div class="msg-content">
            <div class="message bot">New chat started! 👋 Ask me anything about medicine or health.</div>
          </div>
        </div>`);
      showToast('✨ New chat started');
    };
  
    // ── Sidebar toggle ──
    window.toggleSidebar = function () {
      sidebarOpen = !sidebarOpen;
      const panel = $('#sidebar-panel');
      const toggleBtn = $('#rail-sidebar-toggle');
      if (sidebarOpen) {
        panel.removeClass('closed');
        toggleBtn.addClass('sidebar-is-open');
      } else {
        panel.addClass('closed');
        toggleBtn.removeClass('sidebar-is-open');
      }
    };
  
    window.openSidebar = function () {
      if (!sidebarOpen) toggleSidebar();
    };
  
    // ── Bookmarks ──
    function renderBookmarks() {
      if (!bookmarks.length) {
        $('#bookmark-list').html('<div class="empty-state">No bookmarks yet.<br>Click 🔖 on any answer to save it.</div>');
        return;
      }
      $('#bookmark-list').html(bookmarks.map(b => `
        <div class="bookmark-item">
          ${escHtml(b.text.substring(0, 200))}${b.text.length > 200 ? '…' : ''}
          <span class="bk-del" onclick="deleteBookmark(${b.id})">✕</span>
        </div>`).join(''));
    }
  
    window.deleteBookmark = function (id) {
      bookmarks = bookmarks.filter(b => b.id !== id);
      localStorage.setItem('med_bookmarks', JSON.stringify(bookmarks));
      updateBadge(); renderBookmarks();
    };
  
    window.clearBookmarks = function () {
      bookmarks = [];
      localStorage.setItem('med_bookmarks', JSON.stringify(bookmarks));
      updateBadge(); renderBookmarks();
      showToast('🗑️ Bookmarks cleared');
    };
  
    function updateBadge() {
      const b = $('#bk-badge');
      bookmarks.length > 0 ? b.text(bookmarks.length).css('display','flex') : b.hide();
    }
  
    // ── Export PDF ──
    window.exportPDF = function () {
      const messages = [];
      $('#chat-box .msg-row').each(function () {
        const isUser = $(this).hasClass('user-row');
        const text = $(this).find('.message').text().trim();
        if (text) messages.push({ role: isUser ? 'You' : 'Assistant', text });
      });
      if (!messages.length) { showToast('⚠️ No messages to export'); return; }
  
      const rows = messages.map(m =>
        `<div class="msg ${m.role === 'You' ? 'you' : 'bot'}">
          <div class="role">${m.role}</div>
          <div class="text">${m.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
        </div>`
      ).join('');
  
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Medical Chat Export</title>
      <style>
        body{font-family:Georgia,serif;max-width:750px;margin:40px auto;color:#1b3a20}
        h1{font-size:20px;color:#2a6e35;border-bottom:2px solid #2a6e35;padding-bottom:8px}
        .meta{font-size:12px;color:#888;margin-bottom:24px}
        .msg{margin-bottom:16px;padding:12px 16px;border-radius:8px}
        .msg.you{background:#e8f5e9;border-left:4px solid #2a6e35}
        .msg.bot{background:#f9f9f9;border-left:4px solid #aaa}
        .role{font-size:11px;font-weight:bold;text-transform:uppercase;color:#666;margin-bottom:4px}
        .text{font-size:14px;line-height:1.7}
        .disc{margin-top:40px;padding:14px;background:#111;color:#bbb;font-size:11px;font-style:italic;text-align:center;border-radius:6px}
      </style></head><body>
      <h1>🩺 Medical Encyclopedia RAG — Chat Export</h1>
      <div class="meta">Exported: ${new Date().toLocaleString()} · Gale Encyclopedia of Medicine</div>
      ${rows}
      <div class="disc">⚕ Educational purposes only. Not medical advice. © 2026 Muhammad Danish Alam</div>
      </body></html>`;
  
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'medical-chat-export.html';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📄 Exported! Open file → Print → Save as PDF');
    };
  
    // ── Theme ──
    window.toggleTheme = function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      const icon = isDark ? '🌙' : '☀️';
      $('#theme-btn, #theme-rail-btn').text(icon);
      showToast(isDark ? '☀️ Light mode' : '🌙 Dark mode');
    };
  
    // ── Modals ──
    window.openModal = function (id) {
      if (id === 'bookmarks-modal') renderBookmarks();
      $('#' + id).addClass('open');
    };
    window.closeModal = function (id) { $('#' + id).removeClass('open'); };
    $('.modal-overlay').on('click', function (e) {
      if ($(e.target).hasClass('modal-overlay')) $(this).removeClass('open');
    });
  
    // ── Report ──
    window.submitReport = function () {
      if (!$('#issue-desc').val().trim()) { showToast('⚠️ Please describe the issue'); return; }
      closeModal('report-modal');
      $('#issue-desc').val('');
      showToast('✅ Report submitted! Thank you.');
    };
    window.reportViaEmail = function () {
      const type = $('#issue-type').val();
      const desc = $('#issue-desc').val();
      window.open(`mailto:support@example.com?subject=${encodeURIComponent('Issue: ' + type)}&body=${encodeURIComponent('Type: ' + type + '\n\n' + desc)}`);
      closeModal('report-modal');
    };
  
    // ── Helpers ──
    function scrollBottom() {
      const box = document.getElementById('chat-box');
      setTimeout(() => { box.scrollTop = box.scrollHeight; }, 60);
    }
    function escHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function showToast(msg) {
      const t = $('#toast');
      t.text(msg).addClass('show');
      setTimeout(() => t.removeClass('show'), 2600);
    }
  });