const copyButtons = document.querySelectorAll('[data-copy-target]');

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const targetId = button.getAttribute('data-copy-target');
    const source = targetId ? document.getElementById(targetId) : null;

    if (!source) {
      return;
    }

    const text = source.innerText.trim();
    const originalLabel = button.textContent;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const range = document.createRange();
        range.selectNodeContents(source);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        selection?.removeAllRanges();
      }

      button.textContent = 'Copied';
      button.classList.add('is-copied');

      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove('is-copied');
      }, 1800);
    } catch (error) {
      button.textContent = 'Copy failed';
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1800);
      console.error('Copy failed', error);
    }
  });
});

const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const storedTheme = window.localStorage.getItem('design-skills-theme');
const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';

root.setAttribute('data-theme', initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', nextTheme);
    window.localStorage.setItem('design-skills-theme', nextTheme);
  });
}

const header = document.querySelector('[data-site-header]');

if (header) {
  const syncHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}
