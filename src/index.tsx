/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import 'solid-devtools';
import './global/array-helpers';
import App from './App';
import { BrowserWarning } from './browser-warning';



document.querySelector('#browser-warning')?.remove();

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => checkBrowserSupport() ? <App /> : <BrowserWarning />, root!);

function checkBrowserSupport() {
  if (!CSS.supports('z-index', 'sibling-index()')) return false;
  if (!CSS.supports('z-index', 'sibling-count()')) return false;
  if (!CSS.supports('transform', '--over-multi(90deg)')) return false;
  return true;
}
