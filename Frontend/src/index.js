import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    // StrictMode, geliştirme aşamasında olası hataları bulmak için bileşenleri iki kez çalıştırır
    <React.StrictMode>
        {/* Redux Provider: App içindeki tüm sayfalar artık merkezi store'a erişebilir */}
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);