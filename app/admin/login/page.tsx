import React, { useState } from 'react';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('signIn');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="tab">
        <button onClick={() => handleTabChange('signIn')}>Sign In</button>
        <button onClick={() => handleTabChange('createAdmin')}>Create Admin</button>
      </div>
      {activeTab === 'signIn' && (
        <div className="sign-in-form">
          <h2>Sign In</h2>
          <form>
            <label>
              Username:
              <input type="text" name="username" required />
            </label>
            <label>
              Password:
              <input type="password" name="password" required />
            </label>
            <button type="submit">Login</button>
          </form>
        </div>
      )}
      {activeTab === 'createAdmin' && (
        <div className="create-admin-form">
          <h2>Create Admin</h2>
          <form>
            <label>
              New Admin Username:
              <input type="text" name="newAdminUsername" required />
            </label>
            <label>
              New Admin Password:
              <input type="password" name="newAdminPassword" required />
            </label>
            <button type="submit">Create Admin</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginPage;