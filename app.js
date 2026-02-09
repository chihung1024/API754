const selectors = [
  'input[name="processInvolved"]',
  'input[name="fireExplosion"]',
  'input[name="release"]',
  'input[name="injury"]',
  'input[name="damage"]',
  'input[name="offsite"]',
];

const resultTitle = document.getElementById('resultTitle');
const resultBadge = document.getElementById('resultBadge');
const resultSummary = document.getElementById('resultSummary');
const resultTags = document.getElementById('resultTags');
const progressBar = document.getElementById('progressBar');
const progressValue = document.getElementById('progressValue');
const copyResultButton = document.getElementById('copyResult');
const resetFormButton = document.getElementById('resetForm');
const screeningForm = document.getElementById('screeningForm');

const getValue = (name) =>
  document.querySelector(`input[name="${name}"]:checked`)?.value ?? '';

const classificationMap = {
  tier1: {
    title: '製程安全事件：Tier 1（重大）',
    badge: 'Tier 1',
    className: 'tier1',
  },
  tier2: {
    title: '製程安全事件：Tier 2（顯著）',
    badge: 'Tier 2',
    className: 'tier2',
  },
  tier3: {
    title: '製程安全事件：Tier 3（可控/輕微）',
    badge: 'Tier 3',
    className: 'tier3',
  },
  occupational: {
    title: '工安事件（非製程安全事件）',
    badge: '工安事件',
    className: 'occupational',
  },
};

const buildTags = (values) => {
  const tags = [];
  if (values.fireExplosion === 'yes') tags.push('火災/爆炸');
  if (values.release === 'minor') tags.push('小量洩漏');
  if (values.release === 'major') tags.push('大量洩漏');
  if (values.injury !== 'none') tags.push('人員受傷');
  if (values.offsite === 'yes') tags.push('影響廠外');
  if (values.damage === 'major') tags.push('重大財損');
  return tags;
};

const summarize = (values, classificationKey) => {
  const lines = [];
  if (values.processInvolved === 'no') {
    lines.push('事件與製程設備無直接關聯，建議依工安事件流程處理。');
  } else {
    lines.push('事件與製程設備相關，需依製程安全事件流程評估。');
  }

  if (values.fireExplosion === 'yes') {
    lines.push('涉及火災或爆炸，需立即啟動緊急應變並通報高階主管。');
  }

  if (values.release !== 'none') {
    lines.push(`偵測到${values.release === 'major' ? '大量失控' : '小量受控'}洩漏，建議確認物質種類與影響範圍。`);
  }

  if (values.injury !== 'none') {
    lines.push('有人員受傷，請同步醫療處置與事故通報流程。');
  }

  if (values.offsite === 'yes') {
    lines.push('事件可能影響廠外環境，需啟動對外通報機制。');
  }

  if (classificationKey === 'tier3') {
    lines.push('影響可控且未擴大，建議納入近失事件/輕微事件追蹤。');
  }

  return lines.join(' ');
};

const updateProgress = () => {
  const fields = [
    document.getElementById('eventName'),
    document.getElementById('eventLocation'),
    document.getElementById('eventTime'),
    document.getElementById('reporter'),
  ];
  const filled = fields.filter((field) => field && field.value.trim() !== '').length;
  const percent = Math.round((filled / fields.length) * 100);
  progressBar.style.width = `${percent}%`;
  progressValue.textContent = `${percent}%`;
};

const buildCopyText = (values, classification) => {
  const name = document.getElementById('eventName')?.value || '未填寫';
  const location = document.getElementById('eventLocation')?.value || '未填寫';
  const time = document.getElementById('eventTime')?.value || '未填寫';
  const reporter = document.getElementById('reporter')?.value || '未填寫';
  const tags = buildTags(values);
  return [
    `事件名稱：${name}`,
    `地點：${location}`,
    `時間：${time}`,
    `回報人員：${reporter}`,
    `判定結果：${classification.title} (${classification.badge})`,
    `關鍵標籤：${tags.length ? tags.join('、') : '無重大徵象'}`,
    `摘要：${resultSummary.textContent}`,
  ].join('\n');
};

const determineClassification = (values) => {
  if (values.processInvolved === 'no') {
    return 'occupational';
  }

  const severeInjury = ['serious', 'fatal'].includes(values.injury);
  const medicalInjury = values.injury === 'medical';
  const majorDamage = values.damage === 'major';
  const significantDamage = values.damage === 'significant';

  if (
    values.fireExplosion === 'yes' ||
    values.release === 'major' ||
    severeInjury ||
    majorDamage ||
    values.offsite === 'yes'
  ) {
    return 'tier1';
  }

  if (values.release === 'minor' || medicalInjury || significantDamage) {
    return 'tier2';
  }

  return 'tier3';
};

const updateResult = () => {
  const values = {
    processInvolved: getValue('processInvolved'),
    fireExplosion: getValue('fireExplosion'),
    release: getValue('release'),
    injury: getValue('injury'),
    damage: getValue('damage'),
    offsite: getValue('offsite'),
  };

  const classificationKey = determineClassification(values);
  const classification = classificationMap[classificationKey];

  resultTitle.textContent = classification.title;
  resultBadge.textContent = classification.badge;
  resultBadge.className = `badge ${classification.className}`;
  resultSummary.textContent = summarize(values, classificationKey);
  updateProgress();

  resultTags.innerHTML = '';
  const tags = buildTags(values);
  if (tags.length === 0) {
    const emptyTag = document.createElement('span');
    emptyTag.className = 'tag';
    emptyTag.textContent = '無重大徵象';
    resultTags.append(emptyTag);
  } else {
    tags.forEach((tag) => {
      const element = document.createElement('span');
      element.className = 'tag';
      element.textContent = tag;
      resultTags.append(element);
    });
  }
};

selectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((input) => {
    input.addEventListener('change', updateResult);
  });
});

['eventName', 'eventLocation', 'eventTime', 'reporter'].forEach((id) => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', updateProgress);
  }
});

copyResultButton?.addEventListener('click', async () => {
  const values = {
    processInvolved: getValue('processInvolved'),
    fireExplosion: getValue('fireExplosion'),
    release: getValue('release'),
    injury: getValue('injury'),
    damage: getValue('damage'),
    offsite: getValue('offsite'),
  };
  const classificationKey = determineClassification(values);
  const classification = classificationMap[classificationKey];
  const text = buildCopyText(values, classification);

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    copyResultButton.textContent = '已複製';
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.append(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
    copyResultButton.textContent = '已複製';
  }

  setTimeout(() => {
    copyResultButton.textContent = '複製結果摘要';
  }, 2000);
});

resetFormButton?.addEventListener('click', () => {
  screeningForm?.reset();
  updateResult();
});

updateResult();
