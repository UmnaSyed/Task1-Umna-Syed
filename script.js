const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

let expression = '';

function updateDisplay() {
  expressionEl.textContent = expression;

  if (expression === '') {
    resultEl.textContent = '0';
    return;
  }

  const evaluated = safeEvaluate(expression);
  resultEl.textContent = evaluated !== null ? formatNumber(evaluated) : expression;
}

function safeEvaluate(expr) {
  if (!/^[0-9+\-*/.%\s]*$/.test(expr)) return null;

  try {
    const withPercent = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    const value = Function(`"use strict"; return (${withPercent})`)();
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function formatNumber(num) {
  if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-9 && num !== 0)) {
    return num.toExponential(4);
  }
  return parseFloat(num.toFixed(10)).toString();
}

function handleNumber(value) {
  const lastSegment = expression.split(/[\+\-\*\/]/).pop();
  if (value === '.' && lastSegment.includes('.')) return;
  expression += value;
  updateDisplay();
}

function handleOperator(value) {
  if (expression === '' && value !== '-') return;

  const lastChar = expression.slice(-1);
  if (['+', '-', '*', '/'].includes(lastChar)) {
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }
  updateDisplay();
}

function handleAction(action) {
  if (action === 'clear') {
    expression = '';
  } else if (action === 'delete') {
    expression = expression.slice(0, -1);
  } else if (action === 'equals') {
    const evaluated = safeEvaluate(expression);
    if (evaluated !== null) {
      expression = formatNumber(evaluated);
    }
  }
  updateDisplay();
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const { value, action } = button.dataset;

    if (action) {
      handleAction(action);
    } else if (['+', '-', '*', '/'].includes(value)) {
      handleOperator(value);
    } else if (value === '%') {
      expression += '%';
      updateDisplay();
    } else {
      handleNumber(value);
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (/^[0-9.]$/.test(e.key)) {
    handleNumber(e.key);
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    handleOperator(e.key);
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    handleAction('equals');
  } else if (e.key === 'Backspace') {
    handleAction('delete');
  } else if (e.key === 'Escape') {
    handleAction('clear');
  } else if (e.key === '%') {
    expression += '%';
    updateDisplay();
  }
});

updateDisplay();
