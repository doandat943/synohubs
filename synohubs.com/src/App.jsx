import { I18nProvider } from './i18n/I18nProvider';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhySynoHub from './components/WhySynoHub';
import Features from './components/Features';
import AdminTools from './components/AdminTools';
import Premium from './components/Premium';
import Screenshots from './components/Screenshots';
import Testimonials from './components/Testimonials';
import Security from './components/Security';
import Download from './components/Download';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <I18nProvider>
      <div className="app">
        <Navbar />
        <main>
          <Hero />
          <WhySynoHub />
          <Features />
          <AdminTools />
          <Screenshots />
          <Testimonials />
          <Premium />
          <Security />
          <Download />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
