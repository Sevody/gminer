import React from 'react';
import Router from 'react-routing/src/Router';
import fetch from './core/fetch';
import App from './components/App';
import FileUploadPage from './components/FileUploadPage';
import AboutPage from './components/AboutPage';
import Feedback from './components/Feedback';
import NotFoundPage from './components/NotFoundPage';
import ErrorPage from './components/ErrorPage';
import SearchPage from './components/SearchPage';
import Visualization from './components/Visualization'

const router = new Router(on => {
  on('*', async (state, next) => {
    const component = await next();
    return component && <App context={state.context}>{component}</App>;
  });

  on('/visualization', async (req) => {
    return  <Visualization search={req.query.search}/>
  });

  on('/about', async () => <AboutPage />);

  on('/upload', async () => <FileUploadPage />);

  on('/feedback', async () => <Feedback />);

  on('*', async (state) => {
    return <SearchPage />;
  });


  on('error', (state, error) => state.statusCode === 404 ?
    <App context={state.context} error={error}><NotFoundPage /></App> :
    <App context={state.context} error={error}><ErrorPage /></App>
  );
});

export default router;
