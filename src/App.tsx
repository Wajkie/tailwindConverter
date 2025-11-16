import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import conversionReport from '../CONVERSION_REPORT.md?raw';
import duplicatesReport from '../PROPERTY_DUPLICATES_REPORT.md?raw';
import UserDashboardBefore from './features/userDashboard_before/UserDashboard';
import UserDashboardAfter from './features/userDashboard_after/UserDashboard';
import ProductCardBefore from './features/productCard_before/ProductCard';
import ProductCardAfter from './features/productCard_test/ProductCard';
import LoginFormBefore from './features/loginForm_before/LoginForm';
import LoginFormAfter from './features/loginForm_test/LoginForm';
import NavbarBefore from './features/navbar_before/Navbar';
import NavbarAfter from './features/navbar_test/Navbar';
import StatsGridBefore from './features/statsGrid_before/StatsGrid';
import StatsGridAfter from './features/statsGrid_test/StatsGrid';
import AlertBannerBefore from './features/alertBanner_before/AlertBanner';
import AlertBannerAfter from './features/alertBanner_test/AlertBanner';
import './App.css';

// Example data - showing UserDashboard conversion
const beforeCode = `export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Logout
        </button>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase">Total Users</h3>
            <p className="text-3xl font-bold text-gray-800">1,234</p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase">Active Now</h3>
            <p className="text-3xl font-bold text-green-500">89</p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase">New Today</h3>
            <p className="text-3xl font-bold text-orange-500">23</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="p-3 hover:bg-gray-50 rounded cursor-pointer text-gray-800">
              John joined the platform
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}`;

const afterCode = `import styles from "./userDashboard.module.scss";

export default function UserDashboard() {
  return (
    <div className={\`\${styles["div_nth-of-type_1"]} min-h-screen\`}>
      <header className={styles["header"]}>
        <h1 className={styles["h1"]}>User Dashboard</h1>
        <button className={\`\${styles["button"]} hover:bg-gray-100 custom-btn-primary\`}>
          Logout
        </button>
      </header>
      
      <main className={\`\${styles["main"]} space-y-4\`}>
        <div className={styles["div_nth-of-type_2"]}>
          <div className={\`\${styles["div_nth-of-type_3"]} border\`}>
            <h3 className={styles["h3"]}>Total Users</h3>
            <p className={\`\${styles["p_nth-of-type_1"]} dashboard-stat\`}>1,234</p>
          </div>
          <div className={\`\${styles["div_nth-of-type_4"]} border\`}>
            <h3 className={styles["h3_nth-of-type_2"]}>Active Now</h3>
            <p className={\`\${styles["p_nth-of-type_2"]} text-green-500\`}>89</p>
          </div>
          <div className={\`\${styles["div_nth-of-type_5"]} border\`}>
            <h3 className={styles["h3_nth-of-type_3"]}>New Today</h3>
            <p className={\`\${styles["p_nth-of-type_3"]} text-orange-500\`}>23</p>
          </div>
        </div>
      </main>
    </div>
  );
}`;

const scssCode = `.div_nth-of-type_1 {
  background-color: #f9fafb;
}

header {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h1 {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.button {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 0.25rem;
}

main {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem;
}

.div_nth-of-type_2 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.div_nth-of-type_3, .div_nth-of-type_4, .div_nth-of-type_5 {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.div_nth-of-type_6 {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.h2 {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.ul_nth-of-type_1 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.li_nth-of-type_1 {
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #1f2937;
  &:hover {
    background-color: #f9fafb;
  }
}`;

function App() {
  const [activeTab, setActiveTab] = useState<string>('comparison');

  return (
    <div className="app-container">
      <div className="container-fluid py-4">
        <header className="row mb-4">
          <div className="col">
            <div className="text-center">
              <h1 className="display-4 mb-2">Tailwind to CSS Modules Converter</h1>
              <p className="lead text-muted">
                Automated conversion tool with SCSS mixins and semantic selectors
              </p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge bg-success">1.6s conversion time</span>
                <span className="badge bg-info">70% success rate</span>
                <span className="badge bg-warning">31 unknown classes</span>
              </div>
            </div>
          </div>
        </header>

        <main>
          <ul className="nav-tabs">
            <li>
              <button 
                className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                👁️ Live Component Preview
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                📊 Before/After Code
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'testFeatures' ? 'active' : ''}`}
                onClick={() => setActiveTab('testFeatures')}
              >
                🧪 Test Features
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'conversion' ? 'active' : ''}`}
                onClick={() => setActiveTab('conversion')}
              >
                📋 Conversion Report
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'duplicates' ? 'active' : ''}`}
                onClick={() => setActiveTab('duplicates')}
              >
                � Duplicate Properties
              </button>
            </li>
          </ul>

          <div className="tab-content">
          {activeTab === 'preview' && (
            <>
              <div className="row g-3">
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-warning">
                      <h2 className="mb-0">BEFORE: Original Tailwind Classes</h2>
                    </div>
                    <div className="card-body p-0">
                      <div style={{ height: '600px', overflow: 'auto' }}>
                        <UserDashboardBefore />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">AFTER: Converted to CSS Modules</h2>
                    </div>
                    <div className="card-body p-0">
                      <div style={{ height: '600px', overflow: 'auto' }}>
                        <UserDashboardAfter />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col">
                  <div className="card">
                    <div className="card-body">
                      <p className="text-muted mb-0">
                        <strong>Live Conversion Demo:</strong> Left shows the original component with Tailwind classes. 
                        Right shows the same component after running <code>npm run styleConvert userDashboard_after -- --replace</code>. 
                        Both render identically! The converted version uses CSS Modules with semantic selectors and maintainable SCSS.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'testFeatures' && (
            <>
              <div className="row mb-3">
                <div className="col">
                  <div className="card">
                    <div className="card-header bg-primary">
                      <h2 className="mb-0">Test Features with Mixed Valid/Unknown Classes</h2>
                    </div>
                    <div className="card-body">
                      <p className="text-muted mb-3">
                        These features demonstrate the tool's ability to handle <strong>unknown Tailwind classes</strong>. 
                        Unknown classes are preserved in the JSX and highlighted in the conversion report. 
                        All valid classes are converted to CSS Modules with mixins.
                      </p>
                      <div className="alert-info">
                        <strong>⚠️ Important: Visual Verification Required</strong><br/>
                        While most components convert with 100% visual fidelity, some edge cases (like the Stats Grid) may have minor differences. 
                        This tool handles 70-90% of conversions automatically, but <strong>always verify the output visually</strong> and check the conversion report. 
                        The before/after comparison below makes it easy to spot components that need manual adjustment.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Card */}
              <div className="row g-3 mb-3">
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-warning">
                      <h2 className="mb-0">BEFORE: Product Card (Tailwind)</h2>
                    </div>
                    <div className="card-body p-0">
                      <div style={{ height: '400px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <ProductCardBefore />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">AFTER: Product Card (CSS Modules)</h2>
                    </div>
                    <div className="card-body p-0">
                      <div style={{ height: '400px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <ProductCardAfter />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <div className="row g-3 mb-3">
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-warning">
                      <h2 className="mb-0">BEFORE: Login Form (Tailwind)</h2>
                    </div>
                    <div className="card-body p-0">
                      <div style={{ height: '400px', overflow: 'auto' }}>
                        <LoginFormBefore />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">AFTER: Login Form (CSS Modules)</h2>
                    </div>
                    <div className="card-body p-0">
                      <div style={{ height: '400px', overflow: 'auto' }}>
                        <LoginFormAfter />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navbar */}
              <div className="row g-3 mb-3">
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header bg-warning">
                      <h2 className="mb-0">BEFORE: Navbar (Tailwind)</h2>
                    </div>
                    <div className="card-body p-0">
                      <NavbarBefore />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">AFTER: Navbar (CSS Modules)</h2>
                    </div>
                    <div className="card-body p-0">
                      <NavbarAfter />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="row g-3 mb-3">
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header bg-warning">
                      <h2 className="mb-0">BEFORE: Stats Grid (Tailwind)</h2>
                    </div>
                    <div className="card-body p-0">
                      <StatsGridBefore />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">AFTER: Stats Grid (CSS Modules)</h2>
                    </div>
                    <div className="card-body p-0">
                      <StatsGridAfter />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Banners */}
              <div className="row g-3">
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header bg-warning">
                      <h2 className="mb-0">BEFORE: Alert Banners (Tailwind)</h2>
                    </div>
                    <div className="card-body p-0">
                      <AlertBannerBefore />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">AFTER: Alert Banners (CSS Modules)</h2>
                    </div>
                    <div className="card-body p-0">
                      <AlertBannerAfter />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'comparison' && (
            <>
              <div className="row g-3">
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-danger">
                      <h2 className="mb-0">❌ Before: Tailwind Classes</h2>
                    </div>
                    <div className="card-body">
                      <pre className="code-block">
                        <code>{beforeCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card h-100">
                    <div className="card-header bg-success">
                      <h2 className="mb-0">✅ After: CSS Modules</h2>
                    </div>
                    <div className="card-body">
                      <pre className="code-block">
                        <code>{afterCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col">
                  <div className="card">
                    <div className="card-header bg-primary">
                      <h2 className="mb-0">📝 Generated SCSS Module</h2>
                    </div>
                    <div className="card-body">
                      <pre className="code-block">
                        <code>{scssCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'conversion' && (
            <div className="card">
              <div className="card-body markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {conversionReport}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {activeTab === 'duplicates' && (
            <div className="card">
              <div className="card-body markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {duplicatesReport}
                </ReactMarkdown>
              </div>
            </div>
          )}
          </div>
        </main>
        
        <footer className="text-center mt-4 py-3">
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Fredrik Wiking
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
