const copyButtons = document.querySelectorAll('[data-copy-target]');

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const targetId = button.getAttribute('data-copy-target');
    const source = document.getElementById(targetId);

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
