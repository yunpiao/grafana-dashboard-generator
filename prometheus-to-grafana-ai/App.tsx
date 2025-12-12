import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { StepInput } from './components/StepComponents';
import { PlanEditor } from './components/PlanEditor';
import { DashboardPreview } from './components/DashboardPreview';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './components/LandingPage';
import { generateDashboardPlan, generateFinalDashboard } from './services/geminiService';
import { DashboardPlan, AIResponse } from './types';
import { Activity } from 'lucide-react';
import { isSampleData, SAMPLE_DASHBOARD_PLAN, SAMPLE_DASHBOARD_RESULT } from './constants';

const App: React.FC = () => {
  // Show landing page or main app
  const [showLanding, setShowLanding] = useState<boolean>(true);
  
  // State - New 4-step flow: Input -> Plan Edit -> Generate -> Preview
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [rawMetrics, setRawMetrics] = useState<string>('');
  const [dashboardPlan, setDashboardPlan] = useState<DashboardPlan | null>(null);
  const [finalDashboard, setFinalDashboard] = useState<AIResponse | null>(null);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Helper to append logs
  const addLog = (msg: string) => setLoadingLogs(prev => [...prev, msg]);

  // Step 1 -> Step 2: Generate Plan
  const handleGeneratePlan = async () => {
    if (!rawMetrics.trim()) return;
    
    setError(null);
    setIsGeneratingPlan(true);

    try {
      // Check if using sample data - skip AI call for quick validation
      const usingSample = isSampleData(rawMetrics);
      
      if (usingSample) {
        // Simulate realistic delay for demo (10 seconds)
        await new Promise(r => setTimeout(r, 10000));
        setDashboardPlan(SAMPLE_DASHBOARD_PLAN);
        setCurrentStep(2); // Go to Plan Edit
        setIsGeneratingPlan(false);
        return;
      }

      // Real AI Call to generate plan
      const plan: DashboardPlan = await generateDashboardPlan(rawMetrics);
      setDashboardPlan(plan);
      setCurrentStep(2); // Go to Plan Edit
      
    } catch (e: any) {
      setError(e.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Step 2 -> Step 3 -> Step 4: Confirm Plan and Generate Final Dashboard
  const handleConfirmPlan = async () => {
    if (!dashboardPlan) return;
    
    setError(null);
    setCurrentStep(3); // Go to Loading
    setLoadingLogs(['Generating PromQL queries...', 'Building panel configurations...']);

    try {
      const usingSample = isSampleData(rawMetrics);
      
      if (usingSample) {
        // Simulate realistic delay for demo (20 seconds total)
        addLog('Connecting to Gemini 3 Pro...');
        await new Promise(r => setTimeout(r, 3000));
        addLog('Analyzing metric semantics...');
        await new Promise(r => setTimeout(r, 4000));
        addLog('Generating PromQL expressions...');
        await new Promise(r => setTimeout(r, 5000));
        addLog('Building panel configurations...');
        await new Promise(r => setTimeout(r, 5000));
        addLog('Validating dashboard structure...');
        await new Promise(r => setTimeout(r, 3000));
        addLog('Done! Rendering dashboard...');
        
        setFinalDashboard(SAMPLE_DASHBOARD_RESULT);
        setCurrentStep(4); // Go to Preview
        return;
      }

      addLog('Analyzing metrics structure...');
      await new Promise(r => setTimeout(r, 500));
      
      addLog(`Processing ${dashboardPlan.categories.reduce((acc, c) => acc + c.panels.length, 0)} panels...`);
      
      const result = await generateFinalDashboard(rawMetrics, dashboardPlan);
      
      addLog('Finalizing Grafana JSON...');
      addLog('Done!');
      
      await new Promise(r => setTimeout(r, 300));
      
      setFinalDashboard(result);
      setCurrentStep(4); // Go to Preview

    } catch (e: any) {
      setError(e.message || "Generation failed. Please try again.");
      setCurrentStep(2); // Go back to Plan Edit
      setLoadingLogs([]);
    }
  };

  const handleBackToPlan = () => {
    setCurrentStep(2);
    setLoadingLogs([]);
  };

  const handleBackToInput = () => {
    setCurrentStep(1);
    setDashboardPlan(null);
  };

  const handleStartOver = () => {
    setRawMetrics('');
    setDashboardPlan(null);
    setFinalDashboard(null);
    setLoadingLogs([]);
    setCurrentStep(1);
  };

  // Show Landing Page
  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased overflow-y-auto">
      {/* Header - Matching Landing Page Style */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowLanding(true)}>
            <Activity className="text-blue-600 w-7 h-7" />
            <span className="font-bold text-xl tracking-tight text-slate-800">Metrics to Grafana Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
             {currentStep > 1 && (
                <button onClick={handleStartOver} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">
                    Start Over
                </button>
             )}
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                </span>
                Gemini 3 Pro
             </div>
          </div>
        </div>
      </header>

      {/* Mini Hero Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
          </span>
          Powered by Gemini 3 Pro
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Metrics to Grafana Dashboard <span className="text-blue-600">with AI</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Paste your raw metrics, and let AI build a production-ready dashboard for you instantly.
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <div className="max-w-7xl mx-auto px-6 w-full shrink-0 pt-6 pb-4">
             <StepIndicator currentStep={currentStep} totalSteps={4} />
        </div>
        
        {error && (
          <div className="max-w-7xl mx-auto px-6 w-full mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-pulse">
                <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 pb-6 flex flex-col">
            {/* Step 1: Input Metrics */}
            {currentStep === 1 && (
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StepInput 
                        value={rawMetrics} 
                        onValueChange={setRawMetrics}
                        onGenerate={handleGeneratePlan} 
                    />
                    {isGeneratingPlan && (
                      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-4">
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-slate-700 font-medium">Generating plan...</span>
                        </div>
                      </div>
                    )}
                </div>
            )}

            {/* Step 2: Edit Plan */}
            {currentStep === 2 && dashboardPlan && (
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PlanEditor 
                        plan={dashboardPlan}
                        onPlanChange={setDashboardPlan}
                        onConfirm={handleConfirmPlan}
                        onBack={handleBackToInput}
                    />
                </div>
            )}

            {/* Step 3: Generating */}
            {currentStep === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                    <LoadingScreen logs={loadingLogs} />
                </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && finalDashboard && (
                <div className="flex-1 min-h-0 border border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <DashboardPreview data={finalDashboard} />
                </div>
            )}
        </div>
      </main>

      {/* Bottom Notice */}
      <div className="bg-slate-50 border-t border-slate-100 py-4 text-center">
        <p className="text-slate-400 text-xs">
          * This is an interactive simulation. No real data is sent to external servers.
        </p>
      </div>
    </div>
  );
};

export default App;