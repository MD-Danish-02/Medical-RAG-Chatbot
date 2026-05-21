$(document).ready(function() {

            let bookmarks = JSON.parse(localStorage.getItem('med_bookmarks') || '[]');
            let chatHistory = [];
            let currentSessionId = 'session_' + Date.now();
            let sidebarOpen = false;
            let isLoggedIn = false;

            loadHistoryFromBackend();
            updateBadge();
            loadProfile();

            $('#text').on('input', function() {
                $('#char-count').text($(this).val().length + ' / 500');
            });


            // ════════════════════════════════════════
            // ══ PROFILE MENU ══
            // ════════════════════════════════════════

            function loadProfile() {
                $.ajax({
                    url: '/profile',
                    type: 'GET',
                    success: function(data) {
                        isLoggedIn = true;
                        $('#login-header-btn').hide();

                        if (data.profile_pic) {
                            $('#profile-avatar-img').attr('src', data.profile_pic).show();
                            $('#profile-avatar-fallback').hide();
                            $('#pd-avatar').attr('src', data.profile_pic).show();
                            $('#pd-avatar-fallback').hide();
                        }

                        $('#pd-name').text(data.name || 'User');
                        $('#pd-email').text(data.email || '');
                        $('#pd-chat-count').text(data.chat_count || '—');
                        $('#pd-joined').text(data.joined || '—');
                    },
                    error: function() {
                        isLoggedIn = false;
                        $('#login-header-btn').css('display', 'flex');
                        $('#pd-name').text('Guest User');
                        $('#pd-email').text('Not logged in');
                        $('#pd-chat-count').text('—');
                        $('#pd-joined').text('—');
                        console.log('Profile not loaded — guest mode');
                    }
                });
            }

            window.toggleProfileMenu = function() {
                if (!isLoggedIn) {
                    openModal('login-modal');
                    return;
                }
                $('#profile-dropdown').toggleClass('open');
            };

            $(document).on('click', function(e) {
                if (!$(e.target).closest('#profile-rail-wrapper').length) {
                    $('#profile-dropdown').removeClass('open');
                }
            });

            window.doLogout = function() {
                window.location.href = '/logout';
            };

            window.openDeleteConfirm = function() {
                $('#profile-dropdown').removeClass('open');
                openModal('delete-account-modal');
            };

            window.confirmDeleteAccount = function() {
                $.ajax({
                    url: '/delete_account',
                    type: 'DELETE',
                    success: function() {
                        showToast('✅ Account deleted successfully');
                        setTimeout(function() {
                            window.location.href = '/logout';
                        }, 1400);
                    },
                    error: function() {
                        showToast('❌ Failed to delete account');
                    }
                });
            };


            // ════════════════════════════════════════
            // ══ SEND MESSAGE ══
            // ════════════════════════════════════════

            function sendMessage() {
                const raw = $('#text').val().trim();
                if (!raw) return;

                if (!isLoggedIn) {
                    openModal('login-modal');
                    return;
                }

                appendUserMsg(raw);
                $('#text').val('');
                $('#char-count').text('0 / 500');
                scrollBottom();

                $('#chat-box').append(`
        <div class="msg-row" id="typing-row">
            <div class="bot-avatar">📖</div>
            <div class="msg-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>`);
                scrollBottom();

                $.ajax({
                        data: { msg: raw, session_id: currentSessionId },
                        type: 'POST',
                        url: '/get'
                    })
                    .done(function(data) {
                        $('#typing-row').remove();
                        const msgId = 'msg' + Date.now();
                        appendBotMsg(data.answer, msgId, data.sources);
                        saveHistory(raw, msgId);
                        scrollBottom();
                    })
                    .fail(function(xhr) {
                        $('#typing-row').remove();
                        if (xhr.status === 401) {
                            openModal('login-modal');
                        } else {
                            appendBotMsg('⚠️ Something went wrong. Please try again.', null, []);
                        }
                        scrollBottom();
                    });
            }

            $('#send').click(sendMessage);
            $('#text').keypress(function(e) {
                if (e.which === 13) sendMessage();
            });


            // ════════════════════════════════════════
            // ══ MESSAGE RENDERING ══
            // ════════════════════════════════════════

            function appendUserMsg(text) {
                $('#chat-box').append(`
        <div class="msg-row user-row">
            <div class="msg-content">
                <div class="message user">${escHtml(text)}</div>
            </div>
        </div>`);
            }

            function appendBotMsg(text, msgId, sources) {
                const id = msgId || ('msg' + Date.now());
                const related = getRelated(text);

                const relHtml = related.length ?
                    `<div class="related-topics">${related.map(t =>
                `<span class="related-chip" onclick="askTopic('${t}')">📖 ${t}</span>`
            ).join('')}</div>` : '';

        const srcHtml = (sources && sources.length) ?
            `<div class="source-citation">📚 <b>Source:</b> ${sources.map(s =>
                `Gale Encyclopedia of Medicine — Page ${s.page}`
            ).join(', ')}</div>` : '';

        $('#chat-box').append(`
        <div class="msg-row" id="${id}">
            <div class="bot-avatar">📖</div>
            <div class="msg-content">
                <div class="message bot">${escHtml(text)}</div>
                ${srcHtml}
                ${relHtml}
                <div class="msg-actions">
                    <button class="msg-action-btn" onclick="copyMsg('${id}')">📋 Copy</button>
                    <button class="msg-action-btn" onclick="bookmarkMsg('${id}')">🔖 Save</button>
                    <button class="msg-action-btn" onclick="speakMsg('${id}')">🔊 Listen</button>
                </div>
            </div>
        </div>`);
    }


    // ════════════════════════════════════════
    // ══ MESSAGE ACTIONS ══
    // ════════════════════════════════════════

    window.copyMsg = function(id) {
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
        } catch (e) {
            showToast('❌ Copy not supported');
        }
    };

    window.bookmarkMsg = function(id) {
        const t = $('#' + id + ' .message.bot').text();
        bookmarks.unshift({ id: Date.now(), text: t });
        localStorage.setItem('med_bookmarks', JSON.stringify(bookmarks));
        updateBadge();
        showToast('🔖 Saved to bookmarks!');
    };

    window.speakMsg = function(id) {
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


    // ════════════════════════════════════════
    // ══ CATEGORY CHIPS ══
    // ════════════════════════════════════════

    window.selectCategory = function(el, query) {
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

    window.askTopic = function(topic) {
        $('#text').val(topic);
        $('#char-count').text(topic.length + ' / 500');
        $('#text').focus();
    };


    // ════════════════════════════════════════
    // ══ RELATED TOPICS MAP ══
    // ════════════════════════════════════════

    function getRelated(text) {
        return [];
    }


    // ════════════════════════════════════════
    // ══ CHAT HISTORY ══
    // ════════════════════════════════════════

    function saveHistory(q, msgId) {
        const existing = chatHistory.find(e => e.session_id === currentSessionId);
        if (existing) {
            existing.msg_count = (existing.msg_count || 1) + 1;
        } else {
            chatHistory.unshift({
                id: Date.now(),
                session_id: currentSessionId,
                q,
                msgId,
                msg_count: 1
            });
        }
        renderHistory();
    }

    function renderHistory() {
        if (!chatHistory.length) {
            $('#history-list').html('<div class="empty-state">No chats yet</div>');
            return;
        }
        $('#history-list').html(chatHistory.map(e => `
        <div class="history-item ${e.session_id === currentSessionId ? 'active' : ''}"
             data-sessionid="${e.session_id}" data-id="${e.id}">
            <span>💬</span>
            <span class="hi-text" title="${escHtml(e.q)}">
                ${escHtml(e.q.substring(0, 26))}${e.q.length > 26 ? '…' : ''}
            </span>
            <button class="hi-del-btn" onclick="deleteHistory('${e.session_id}', event)" title="Delete">✕</button>
        </div>`).join(''));

        $('#history-list .history-item').on('click', function() {
            const sessionId = $(this).data('sessionid');
            loadSession(sessionId);
        });
    }

    function loadSession(sessionId) {
        if (sessionId === currentSessionId) {
            showToast('📍 Already in this chat');
            return;
        }
        currentSessionId = sessionId;
        $('#chat-box').html('');

        $.ajax({
            url: '/session/' + sessionId,
            type: 'GET',
            success: function(data) {
                data.forEach(chat => {
                    appendUserMsg(chat.question);
                    appendBotMsg(chat.answer, 'msg' + chat.id, []);
                });
                scrollBottom();
                renderHistory();
                showToast('📂 Chat loaded');
            },
            error: function() {
                showToast('❌ Failed to load chat');
            }
        });
    }

    function loadHistoryFromBackend() {
        $.ajax({
            url: '/history',
            type: 'GET',
            success: function(data) {
                chatHistory = data.map(s => ({
                    id: Date.now() + Math.random(),
                    session_id: s.session_id,
                    q: s.question,
                    msg_count: s.msg_count,
                    msgId: ''
                }));
                renderHistory();
            },
            error: function() {
                console.log('Failed to load backend history');
            }
        });
    }

    window.deleteHistory = function(sessionId, event) {
        event.stopPropagation();
        $.ajax({
            url: '/delete_chat/' + sessionId,
            type: 'DELETE',
            success: function() {
                chatHistory = chatHistory.filter(e => e.session_id !== sessionId);
                renderHistory();
                showToast('🗑️ Chat deleted successfully');
            },
            error: function() {
                showToast('❌ Failed to delete chat');
            }
        });
    };

    window.newChat = function() {
        currentSessionId = 'session_' + Date.now();
        $('#chat-box').html(`
        <div class="msg-row">
            <div class="bot-avatar">📖</div>
            <div class="msg-content">
                <div class="message bot">
                    New chat started! 👋 Ask me anything about medicine or health.
                </div>
            </div>
        </div>`);
        renderHistory();
        showToast('✨ New chat started');
    };


    // ════════════════════════════════════════
    // ══ SIDEBAR TOGGLE ══
    // ════════════════════════════════════════

    window.toggleSidebar = function() {
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

    window.openSidebar = function() {
        if (!sidebarOpen) toggleSidebar();
    };


    // ════════════════════════════════════════
    // ══ BOOKMARKS ══
    // ════════════════════════════════════════

    // ✅ UPDATED: Hover pe full text tooltip
    function renderBookmarks() {
        if (!bookmarks.length) {
            $('#bookmark-list').html('<div class="empty-state">No bookmarks yet.<br>Click 🔖 on any answer to save it.</div>');
            return;
        }
        $('#bookmark-list').html(bookmarks.map(b => `
        <div class="bookmark-item" title="${escHtml(b.text)}">
            ${escHtml(b.text.substring(0, 200))}${b.text.length > 200 ? '…' : ''}
            <span class="bk-del" onclick="deleteBookmark(${b.id})">✕</span>
        </div>`).join(''));
    }

    window.deleteBookmark = function(id) {
        bookmarks = bookmarks.filter(b => b.id !== id);
        localStorage.setItem('med_bookmarks', JSON.stringify(bookmarks));
        updateBadge();
        renderBookmarks();
    };

    window.clearBookmarks = function() {
        bookmarks = [];
        localStorage.setItem('med_bookmarks', JSON.stringify(bookmarks));
        updateBadge();
        renderBookmarks();
        showToast('🗑️ Bookmarks cleared');
    };

    function updateBadge() {
        const b = $('#bk-badge');
        bookmarks.length > 0
            ? b.text(bookmarks.length).css('display', 'flex')
            : b.hide();
    }


    // ════════════════════════════════════════
    // ══ EXPORT PDF ══
    // ════════════════════════════════════════

    window.exportPDF = function() {
        const messages = [];
        $('#chat-box .msg-row').each(function() {
            const isUser = $(this).hasClass('user-row');
            const text = $(this).find('.message').text().trim();
            const source = $(this).find('.source-citation').text().trim();
            if (text) messages.push({ role: isUser ? 'You' : 'Assistant', text, source });
        });
        if (!messages.length) { showToast('⚠️ No messages to export'); return; }

        const rows = messages.map(m =>
            `<div class="msg ${m.role === 'You' ? 'you' : 'bot'}">
                <div class="role">${m.role}</div>
                <div class="text">${m.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                ${m.source ? `<div class="src">${m.source}</div>` : ''}
            </div>`
        ).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Medical Chat Export</title>
        <style>
            body{font-family:Georgia,serif;max-width:750px;margin:40px auto;color:#1b3a20}
            h1{font-size:20px;color:#2a6e35;border-bottom:2px solid #2a6e35;padding-bottom:8px}
            .meta{font-size:12px;color:#888;margin-bottom:24px}
            .msg{margin-bottom:16px;padding:12px 16px;border-radius:8px}
            .msg.you{background:#e8f5e9;border-left:4px solid #2a6e35}
            .msg.bot{background:#f9f9f9;border-left:4px solid #aaa}
            .role{font-size:11px;font-weight:bold;text-transform:uppercase;color:#666;margin-bottom:4px}
            .text{font-size:14px;line-height:1.7}
            .src{font-size:11px;color:#888;margin-top:6px;padding-top:6px;border-top:1px dashed #ddd;font-style:italic}
            .disc{margin-top:40px;padding:14px;background:#111;color:#bbb;font-size:11px;
                  font-style:italic;text-align:center;border-radius:6px}
        </style></head><body>
        <h1>🩺 Medical Encyclopedia RAG — Chat Export</h1>
        <div class="meta">Exported: ${new Date().toLocaleString()} · Gale Encyclopedia of Medicine</div>
        ${rows}
        <div class="disc">⚕ Educational purposes only. Not medical advice. © 2026 Muhammad Danish Alam</div>
        </body></html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medical-chat-export.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('📄 Exported! Open file → Print → Save as PDF');
    };


    // ════════════════════════════════════════
    // ══ THEME TOGGLE ══
    // ════════════════════════════════════════

    window.toggleTheme = function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        $('#theme-btn').text(isDark ? '🌙' : '☀️');
        showToast(isDark ? '☀️ Light mode' : '🌙 Dark mode');
    };


    // ════════════════════════════════════════
    // ══ MODALS ══
    // ════════════════════════════════════════

    window.openModal = function(id) {
        if (id === 'bookmarks-modal') renderBookmarks();
        $('#' + id).addClass('open');
    };

    window.closeModal = function(id) {
        $('#' + id).removeClass('open');
    };

    $('.modal-overlay').on('click', function(e) {
        if ($(e.target).hasClass('modal-overlay')) $(this).removeClass('open');
    });


    // ════════════════════════════════════════
    // ══ REPORT ══
    // ════════════════════════════════════════

    window.submitReport = function() {
        if (!$('#issue-desc').val().trim()) {
            showToast('⚠️ Please describe the issue');
            return;
        }
        $.ajax({
            url: '/report',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                type: $('#issue-type').val(),
                description: $('#issue-desc').val(),
                email: $('#issue-email').val()
            }),
            success: function() {
                closeModal('report-modal');
                $('#issue-desc').val('');
                $('#issue-email').val('');
                showToast('✅ Report submitted! Thank you.');
            },
            error: function() {
                showToast('❌ Failed to submit report');
            }
        });
    };

    window.reportViaEmail = function() {
        const type = $('#issue-type').val();
        const desc = $('#issue-desc').val();
        window.location.href = `mailto:mddanish.genai@gmail.com?subject=${encodeURIComponent('Issue: ' + type)}&body=${encodeURIComponent('Type: ' + type + '\n\nDescription: ' + desc)}`;
        closeModal('report-modal');
    };


    // ════════════════════════════════════════
    // ══ HELPERS ══
    // ════════════════════════════════════════

    function scrollBottom() {
        const box = document.getElementById('chat-box');
        setTimeout(() => { box.scrollTop = box.scrollHeight; }, 60);
    }

    function escHtml(s) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function showToast(msg) {
        const t = $('#toast');
        t.text(msg).addClass('show');
        setTimeout(() => t.removeClass('show'), 2600);
    }

});