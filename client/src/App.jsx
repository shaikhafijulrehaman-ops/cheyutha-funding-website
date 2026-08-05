import React, { useState, useEffect, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DonateModal from './components/DonateModal';
import MainPortal from './pages/MainPortal';
const Transparency = React.lazy(() => import('./pages/Transparency'));
const Admin = React.lazy(() => import('./pages/Admin'));
import { api } from './api';
import CustomDialogProvider from './components/CustomDialog';
import { ToastProvider } from './components/Toast';

export default function App() {
    const [path, setPath] = useState(window.location.pathname);
    const [isDonateOpen, setIsDonateOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const [activeSection, setActiveSection] = useState('home');

    // Custom router to support backward/forward browser history
    useEffect(() => {
        const handlePopState = () => {
            setPath(window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Load global NGO contact / metadata settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await api.getSettings();
                if (res && !res.error) {
                    setSettings(res);
                }
            } catch (err) {
                console.error("Failed to load settings in App root: ", err);
            }
        };
        loadSettings();
    }, []);

    // Scrollspy to update active header navigation links as visitor scrolls
    useEffect(() => {
        if (path !== '/') return;

        const handleScroll = () => {
            const sections = ['home', 'about', 'community', 'programs', 'gallery', 'sponsors', 'contact'];
            const scrollPosition = window.scrollY + 200;

            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [path]);

    const navigateTo = (newPath) => {
        window.history.pushState({}, '', newPath);
        setPath(newPath);
        window.scrollTo(0, 0);
    };

    return (
        <ToastProvider>
            <CustomDialogProvider>
                <div className="app-root">
                    {/* Global Header (Not shown on admin console to maximize screen layout space) */}
                    {path !== '/admin' && (
                        <Header 
                            activeSection={activeSection} 
                            onDonateClick={() => setIsDonateOpen(true)} 
                            currentPath={path}
                            navigateTo={navigateTo}
                        />
                    )}

                    {/* Content Pages Router */}
                    <main>
                        <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>}>
                            {path === '/' && (
                                <MainPortal 
                                    onDonateClick={() => setIsDonateOpen(true)} 
                                    navigateTo={navigateTo}
                                />
                            )}
                            {path === '/transparency' && (
                                <Transparency />
                            )}
                            {path === '/admin' && (
                                <Admin />
                            )}
                        </Suspense>
                    </main>

                    {/* Global Footer (Hidden in admin mode) */}
                    {path !== '/admin' && (
                        <Footer 
                            navigateTo={navigateTo} 
                            settings={settings}
                        />
                    )}

                    {/* Donate Modal Form Overlay */}
                    <DonateModal 
                        isOpen={isDonateOpen} 
                        onClose={() => setIsDonateOpen(false)} 
                    />
                </div>
            </CustomDialogProvider>
        </ToastProvider>
    );
}
