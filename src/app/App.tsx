import { useRoute } from './routes';
import { Home } from './pages/Home';
import { Practice, PendingSessionPage } from './pages/Practice';
import { Daily } from './pages/Daily';
import { Simulation } from './pages/Simulation';
import { Progress } from './pages/Progress';
import { Learn, Lesson } from './pages/Learn';
import { Settings } from './pages/Settings';
import { Essay } from './pages/Essay';

export function App() {
  const { segs } = useRoute();
  switch (segs[0]) {
    case 'practice': return <Practice />;
    case 'retry': return <PendingSessionPage />;
    case 'daily': return <Daily />;
    case 'sim': return <Simulation />;
    case 'progress': return <Progress />;
    case 'learn': return segs[1] ? <Lesson slug={segs[1]} /> : <Learn />;
    case 'settings': return <Settings />;
    case 'essay': return <Essay />;
    default: return <Home />;
  }
}
