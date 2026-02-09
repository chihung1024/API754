/* DOM Elements */
const selectors = [
  'input[name="processInvolved"]',
  'input[name="fireCost"]',
  'input[name="injury"]',
  'input[name="release"]',
  'input[name="community"]',
];

const elements = {
  resultCard: document.querySelector('.result-card'),
  resultTitle: document.getElementById('resultTitle'),
  resultBadge: document.getElementById('resultBadge'),
  resultSummary: document.getElementById('resultSummary'),
  resultTags: document.getElementById('resultTags'),
  consequenceSection: document.getElementById('consequenceSection'),
  copyButton: document.getElementById('copyResult'),
  resetButton: document.getElementById('resetForm'),
  form: document.getElementById('triageForm'),
};

const getValue = (name) =>
  document.querySelector(`input[name="${name}"]:checked`)?.value ?? '';

/* Classification Logic (API RP 754) */
const determineClassification = (values) => {
  // 1. Applicability Check
  if (values.processInvolved === 'no') {
    return {
      key: 'non_pse',
      title: '非製程安全事件 (Non-PSE)',
      badge: 'Non-PSE',
      className: 'occupational', // Use blue styling
      summary: '此事件不涉及製程，屬於一般工安事件 (Occupational Safety) 或其他類別。'
    };
  }

  // 2. Tier 1 Criteria (Highest Priority)
  // - LTI / Fatality
  // - Hospital Admission (3rd Party)
  // - Fire/Explosion > $100k
  // - Release > Tier 1 TQ
  // - Community Evacuation/Shelter
  if (
    values.injury === 'lti_fatality' ||
    values.injury === 'admission' ||
    values.fireCost === 'tier1' ||
    values.release === 'tier1' ||
    values.community === 'tier1'
  ) {
    return {
      key: 'tier1',
      title: 'Tier 1 重大製程事故',
      badge: 'Tier 1 PSE',
      className: 'tier1',
      summary: '符合 Tier 1 定義：造成嚴重人員傷亡、重大財損、大量洩漏或社區影響。需立即通報並啟動最高層級調查。'
    };
  }

  // 3. Tier 2 Criteria
  // - Recordable Injury
  // - Fire/Explosion > $2,500
  // - Release > Tier 2 TQ
  if (
    values.injury === 'recordable' ||
    values.fireCost === 'tier2' ||
    values.release === 'tier2'
  ) {
    return {
      key: 'tier2',
      title: 'Tier 2 顯著製程事故',
      badge: 'Tier 2 PSE',
      className: 'tier2',
      summary: '符合 Tier 2 定義：造成可記錄職災、顯著財損或中量洩漏。需進行完整調查。'
    };
  }

  // 4. Tier 3 / Near Miss
  return {
    key: 'tier3',
    title: 'Tier 3 / 近失事件 (Near Miss)',
    badge: 'Tier 3 / NM',
    className: 'tier3',
    summary: '未達 Tier 1/2 門檻，但涉及製程物質釋放或挑戰安全系統。建議作為 Tier 3 指標或近失事件追蹤。'
  };
};

/* Build Tags based on triggers */
const buildTags = (values) => {
  const tags = [];

  if (values.processInvolved === 'no') {
    tags.push('❌ 非製程區');
    return tags;
  }

  if (values.fireCost === 'tier1') tags.push('🔥 火災損失 >$100k (T1)');
  if (values.fireCost === 'tier2') tags.push('🔥 火災損失 >$2,5k (T2)');

  if (values.injury === 'lti_fatality') tags.push('💀 死亡/損失工時 (T1)');
  if (values.injury === 'admission') tags.push('🏥 第三方住院 (T1)');
  if (values.injury === 'recordable') tags.push('🩹 可記錄職災 (T2)');

  if (values.release === 'tier1') tags.push('⚠️ 洩漏 > T1 TQ (T1)');
  if (values.release === 'tier2') tags.push('💧 洩漏 > T2 TQ (T2)');

  if (values.community === 'tier1') tags.push('📢 社區疏散/避難 (T1)');

  if (tags.length === 0) tags.push('✅ 無重大後果');

  return tags;
};

/* UI Update Loop */
const updateUI = () => {
  const values = {
    processInvolved: getValue('processInvolved'),
    fireCost: getValue('fireCost'),
    injury: getValue('injury'),
    release: getValue('release'),
    community: getValue('community'),
  };

  // Logical UI State: Disable Consequence Section if Process Involved is No
  if (values.processInvolved === 'no') {
    elements.consequenceSection.style.opacity = '0.5';
    elements.consequenceSection.style.pointerEvents = 'none';
  } else {
    elements.consequenceSection.style.opacity = '1';
    elements.consequenceSection.style.pointerEvents = 'auto';
  }

  const result = determineClassification(values);

  // Render Text
  elements.resultTitle.textContent = result.title;
  elements.resultBadge.textContent = result.badge;
  elements.resultSummary.textContent = result.summary;

  // Render Clean Tags
  elements.resultTags.innerHTML = '';
  const tags = buildTags(values);
  tags.forEach(text => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = text;
    elements.resultTags.appendChild(span);
  });

  // Render Colors
  elements.resultCard.className = `result-card glass-panel ${result.className}`;
};

/* Listeners */
selectors.forEach(selector => {
  document.querySelectorAll(selector).forEach(radio => {
    radio.addEventListener('change', updateUI);
  });
});

elements.resetButton.addEventListener('click', () => {
  elements.form.reset();
  // Re-enable section manually on reset
  elements.consequenceSection.style.opacity = '1';
  elements.consequenceSection.style.pointerEvents = 'auto';
  updateUI();
});

elements.copyButton.addEventListener('click', async () => {
  const textToCopy = `[API 754 判定結果]\n等級: ${elements.resultBadge.textContent}\n說明: ${elements.resultTitle.textContent}\n關鍵因子: ${Array.from(elements.resultTags.children).map(t => t.textContent).join(', ')}`;
  try {
    await navigator.clipboard.writeText(textToCopy);
    const originalText = elements.copyButton.innerHTML;
    elements.copyButton.innerHTML = '<span class="icon">✔️</span> 已複製';
    setTimeout(() => elements.copyButton.innerHTML = originalText, 2000);
  } catch (err) { alert('複製失敗'); }
});

// Init
updateUI();
