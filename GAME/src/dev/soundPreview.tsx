import ReactDOM from 'react-dom/client';
import '../index.css';
import { SoundBoard } from './soundBoard';

/** Development page (sound.html): listen to every sound effect and try the ambience. */
ReactDOM.createRoot(document.getElementById('root')!).render(<SoundBoard />);
