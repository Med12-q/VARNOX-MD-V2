import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Layout } from './components/layout';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import Commands from './pages/commands';
import Groups from './pages/groups';
import Users from './pages/users';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      
      <Route path="/commands">
        <Layout><Commands /></Layout>
      </Route>
      
      <Route path="/groups">
        <Layout><Groups /></Layout>
      </Route>
      
      <Route path="/users">
        <Layout><Users /></Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
