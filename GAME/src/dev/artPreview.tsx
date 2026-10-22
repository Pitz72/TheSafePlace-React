import ReactDOM from 'react-dom/client';
import '../index.css';
import { Preview } from './compositions';

/** Development page (preview.html): one illustration full-page, for checking the art and exporting covers. */
ReactDOM.createRoot(document.getElementById('root')!).render(<Preview />);
