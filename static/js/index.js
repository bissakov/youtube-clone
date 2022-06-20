function print(s) {
  console.log(s);
}

function formatViews() {
  function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }
  const viewsElements = document.querySelectorAll('.info#views');
  [...viewsElements].forEach((element, index) => {
    if (element.innerHTML.indexOf('views') === -1) {
      const views = parseInt(element.innerHTML);
      element.innerHTML = (views >= 1000 && views < 1000000) ? `${parseInt(views/1000)}K views` : (views >= 1000000) ? `${round(views/1000000, 1)}M views` : `${views} views`;
    }
  });
}

function formatTitles() {
  const titleElements = document.getElementsByClassName('title');
  [...titleElements].forEach((element, index) => {
    const divHeight = element.offsetHeight;
    const lineHeight = parseInt(window.getComputedStyle(element, null).getPropertyValue('line-height'));
    const lines = divHeight / lineHeight;
    if (lines > 2) {
      // const title = element.innerText;
      // element.innerHTML = `${title.slice(0, 2 * parseInt(title.length / lines))}...`
      console.log(lines, element.innerHTML, element);
    }
  });
}

function formatData() {
  formatViews();
  formatTitles();
}

function showRatios() {
  const ratios = document.getElementsByClassName('ratio');
  [...ratios].forEach((element, index) => {
    const ratio_string = element.firstChild.getAttribute('title');
    const ratio = parseInt(ratio_string.slice(0, ratio_string.length - 2));
    const className = ratio >= 95 ? 'high' : ratio >= 85 ? 'upper-mid' : ratio >= 75 ? 'mid' : ratio >= 65 ? 'lower-mid' : 'low';
    element.classList.add(className);
  });
}

function toggleSortMenu() {
  let checkBox = document.querySelector('#sort-btn');
  const sortMenu = document.querySelector('.sort-menu');
  if (checkBox.checked) {
    sortMenu.classList.remove('hidden');
    sortMenu.classList.add('visible');
  } else {
    sortMenu.classList.remove('visible');
    sortMenu.classList.add('hidden');
  }
}

function uncheckNonActive() {
  document.addEventListener('click', function(e) {
    e = e || window.event;
    let target = e.target, text = target.textContent || target.innerText;   
    console.log(target.tagName);
  }, false);
}

function updateBar(step, page) {
  const root = document.querySelector(':root');
  root.style.setProperty('--bar-width', `${step * (page + 1)}%`);
  formatData();
  showRatios();
  toggleSortMenu();
}

async function loadNext() {
  const total = parseInt(document.querySelector('.container').dataset.total)
  const relPath = window.location.pathname + window.location.search;
  let page = (relPath.indexOf('page') === -1) ? 1 : parseInt(relPath.slice(relPath.indexOf('=') + 1, relPath.length));
    
  async function load(page) {
    const step = 100 / parseInt(document.querySelector('.container').dataset.total);
    if (page + 1 > total) {
      formatData();
      showRatios();
      toggleSortMenu();
      return;
    }
    const container = document.querySelector('.container');
    fetch(`${location.href}?page=${page + 1}`).then(res => res.text()).then((responseText) => {
      const doc = new DOMParser().parseFromString(responseText, 'text/html');
      const items = doc.querySelector('.container').childNodes;
      for (let i = 0; i < items.length; i++) {
        if (items[i].textContent.trim().length !== 0) container.appendChild(items[i]);
      }
      formatData();
      showRatios();
      toggleSortMenu();
    });
    updateBar(step, page);
    // uncheckNonActive();
  };

  document.addEventListener('DOMContentLoaded', async function(e) {
    document.addEventListener('scroll', async function(e) {
      if (page + 1 > total) return;
      const documentHeight = document.body.scrollHeight;
      let currentScroll = window.scrollY + window.innerHeight;
      if(currentScroll + 1 > documentHeight) {
        await load(page);
        page++;
      }
    })
  });
}

function selectSort() {
  const btns = [...document.querySelectorAll('.sort-item')];
  btns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      btn.classList.add('selected');
      btns.forEach((el, index) => { if (el !== btn) el.classList.remove('selected'); });
    });
  });
}

function main() {
  formatData();
  showRatios();
  toggleSortMenu();
  uncheckNonActive();
  loadNext();
  selectSort();
}

main();