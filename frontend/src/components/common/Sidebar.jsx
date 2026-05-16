import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  FileText, 
  Users, 
  Bell,
  Scale,
  LogOut,
  Menu,
  X,
  Shield,
  Video
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const getFormattedName = () => {
    if (!user?.name) return 'User';
    // If name already contains brackets, return it
    if (user.name.includes('(')) return user.name;
    
    const roleMap = {
      'super_admin': 'Admin',
      'court_admin': 'Admin',
      'judge': 'Judge',
      'lawyer': 'Lawyer',
      'police': 'Police',
      'client': 'Client'
    };
    
    const roleLabel = roleMap[user.role] || user.role.replace('_', ' ');
    return `${user.name} (${roleLabel})`;
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client'] },
    { name: 'Police Dashboard', href: '/police-dashboard', icon: Shield, roles: ['police'] },
    { name: 'FIR Records', href: '/firs', icon: FileText, roles: ['police', 'judge', 'super_admin'] },
    { name: 'Cases', href: '/cases', icon: Briefcase, roles: ['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client'] },
    { name: 'Hearings', href: '/hearings', icon: Calendar, roles: ['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client'] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['super_admin'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client', 'police'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-gray-50/95 dark:bg-gray-950/95 border-r border-white/10
          transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/30">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">JUDICIAL</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-bold text-sm tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-white/10 p-6 bg-black/5">
            <div className="flex items-center space-x-3 mb-6 p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-black shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {getFormattedName()}
                </p>
                <p className="text-[10px] text-primary-500 font-black uppercase tracking-tighter truncate">
                  {user?.role?.includes('admin') ? 'admin' : user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm border border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
