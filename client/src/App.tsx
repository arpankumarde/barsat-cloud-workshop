
import RainBackground from './components/RainBackground';
import RainCloudForm from './components/RainCloudForm';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-200 to-blue-300 relative overflow-hidden">
      <RainBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          <RainCloudForm />
        </div>
      </div>
      
      {/* Additional atmospheric elements */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-blue-400/10 pointer-events-none" />
    </div>
  );
}

export default App;