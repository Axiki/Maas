import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  MoreHorizontal,
  Star,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'supervisor' | 'cashier' | 'waiter' | 'bartender' | 'chef' | 'kitchen-staff';
  department: 'front-of-house' | 'back-of-house' | 'management' | 'support';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  hireDate: Date;
  salary: number;
  hourlyRate: number;
  location: string;
  avatar?: string;
  performance: {
    rating: number;
    attendance: number;
    sales: number;
    customerSatisfaction: number;
  };
  schedule: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  permissions: string[];
  certifications: string[];
  notes: string;
}

interface EmployeeManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Mock employee data - in real app this would come from API
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@masrestaurant.com',
      phone: '(555) 123-4567',
      role: 'manager',
      department: 'management',
      status: 'active',
      hireDate: new Date('2023-01-15'),
      salary: 65000,
      hourlyRate: 31.25,
      location: 'MAS HQ',
      performance: {
        rating: 4.8,
        attendance: 95,
        sales: 125000,
        customerSatisfaction: 4.9
      },
      schedule: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '10:00', end: '16:00', isWorking: true },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      permissions: ['all'],
      certifications: ['Food Safety', 'Management Training'],
      notes: 'Excellent performance, great leadership skills'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@masrestaurant.com',
      phone: '(555) 234-5678',
      role: 'chef',
      department: 'back-of-house',
      status: 'active',
      hireDate: new Date('2023-03-20'),
      salary: 55000,
      hourlyRate: 26.44,
      location: 'MAS Downtown',
      performance: {
        rating: 4.6,
        attendance: 92,
        sales: 0,
        customerSatisfaction: 4.7
      },
      schedule: {
        monday: { start: '14:00', end: '22:00', isWorking: true },
        tuesday: { start: '14:00', end: '22:00', isWorking: true },
        wednesday: { start: '00:00', end: '00:00', isWorking: false },
        thursday: { start: '14:00', end: '22:00', isWorking: true },
        friday: { start: '14:00', end: '22:00', isWorking: true },
        saturday: { start: '14:00', end: '22:00', isWorking: true },
        sunday: { start: '14:00', end: '22:00', isWorking: true }
      },
      permissions: ['kitchen', 'inventory'],
      certifications: ['Culinary Arts', 'Food Safety', 'HACCP'],
      notes: 'Creative chef, specializes in Asian fusion cuisine'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@masrestaurant.com',
      phone: '(555) 345-6789',
      role: 'waiter',
      department: 'front-of-house',
      status: 'active',
      hireDate: new Date('2024-01-10'),
      salary: 0,
      hourlyRate: 15.50,
      location: 'MAS Airport',
      performance: {
        rating: 4.4,
        attendance: 88,
        sales: 45000,
        customerSatisfaction: 4.8
      },
      schedule: {
        monday: { start: '16:00', end: '23:00', isWorking: true },
        tuesday: { start: '16:00', end: '23:00', isWorking: true },
        wednesday: { start: '16:00', end: '23:00', isWorking: true },
        thursday: { start: '00:00', end: '00:00', isWorking: false },
        friday: { start: '16:00', end: '23:00', isWorking: true },
        saturday: { start: '11:00', end: '23:00', isWorking: true },
        sunday: { start: '11:00', end: '20:00', isWorking: true }
      },
      permissions: ['pos', 'customers'],
      certifications: ['Customer Service', 'Food Safety'],
      notes: 'Excellent customer service skills, very reliable'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@masrestaurant.com',
      phone: '(555) 456-7890',
      role: 'cashier',
      department: 'front-of-house',
      status: 'on-leave',
      hireDate: new Date('2023-11-05'),
      salary: 0,
      hourlyRate: 16.00,
      location: 'MAS HQ',
      performance: {
        rating: 4.2,
        attendance: 85,
        sales: 78000,
        customerSatisfaction: 4.5
      },
      schedule: {
        monday: { start: '08:00', end: '16:00', isWorking: true },
        tuesday: { start: '08:00', end: '16:00', isWorking: true },
        wednesday: { start: '08:00', end: '16:00', isWorking: true },
        thursday: { start: '08:00', end: '16:00', isWorking: true },
        friday: { start: '08:00', end: '16:00', isWorking: true },
        saturday: { start: '09:00', end: '17:00', isWorking: true },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      permissions: ['pos', 'reports'],
      certifications: ['POS Training', 'Cash Handling'],
      notes: 'Currently on medical leave, expected return in 2 weeks'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@masrestaurant.com',
      phone: '(555) 567-8901',
      role: 'bartender',
      department: 'front-of-house',
      status: 'active',
      hireDate: new Date('2023-08-12'),
      salary: 0,
      hourlyRate: 18.75,
      location: 'MAS Downtown',
      performance: {
        rating: 4.7,
        attendance: 93,
        sales: 95000,
        customerSatisfaction: 4.9
      },
      schedule: {
        monday: { start: '17:00', end: '01:00', isWorking: true },
        tuesday: { start: '17:00', end: '01:00', isWorking: true },
        wednesday: { start: '17:00', end: '01:00', isWorking: true },
        thursday: { start: '17:00', end: '01:00', isWorking: true },
        friday: { start: '17:00', end: '02:00', isWorking: true },
        saturday: { start: '17:00', end: '02:00', isWorking: true },
        sunday: { start: '16:00', end: '23:00', isWorking: true }
      },
      permissions: ['pos', 'inventory'],
      certifications: ['Mixology', 'Alcohol Service', 'Food Safety'],
      notes: 'Expert mixologist, very popular with customers'
    }
  ]);

  const roles = ['all', 'manager', 'supervisor', 'cashier', 'waiter', 'bartender', 'chef', 'kitchen-staff'];
  const departments = ['all', 'front-of-house', 'back-of-house', 'management', 'support'];
  const statuses = ['all', 'active', 'inactive', 'on-leave', 'terminated'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'on-leave': return 'text-yellow-600 bg-yellow-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Employee['status']) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-green-600" />;
      case 'inactive': return <UserX size={16} className="text-gray-600" />;
      case 'on-leave': return <Clock size={16} className="text-yellow-600" />;
      case 'terminated': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Users size={16} className="text-gray-600" />;
    }
  };

  const getRoleColor = (role: Employee['role']) => {
    switch (role) {
      case 'manager': return 'text-purple-600 bg-purple-100';
      case 'supervisor': return 'text-blue-600 bg-blue-100';
      case 'chef': return 'text-orange-600 bg-orange-100';
      case 'bartender': return 'text-pink-600 bg-pink-100';
      case 'waiter': return 'text-green-600 bg-green-100';
      case 'cashier': return 'text-indigo-600 bg-indigo-100';
      case 'kitchen-staff': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    showToast({
      title: 'Employee Data Updated',
      description: 'Employee information has been refreshed',
      tone: 'success',
      duration: 2000
    });
  };

  const handleExport = () => {
    showToast({
      title: 'Export Started',
      description: 'Employee report is being generated',
      tone: 'info',
      duration: 3000
    });
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditEmployee(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('Are you sure you want to terminate this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      showToast({
        title: 'Employee Terminated',
        description: 'Employee has been removed from the system',
        tone: 'info',
        duration: 2000
      });
    }
  };

  const getTotalEmployees = () => employees.length;
  const getActiveEmployees = () => employees.filter(emp => emp.status === 'active').length;
  const getOnLeaveEmployees = () => employees.filter(emp => emp.status === 'on-leave').length;
  const getAveragePerformance = () => {
    const totalRating = employees.reduce((sum, emp) => sum + emp.performance.rating, 0);
    return (totalRating / employees.length).toFixed(1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-7xl max-h-[95vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-line p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="heading-sm text-ink">Employee Management</h2>
                  <p className="body-xs text-muted">Manage staff, schedules, performance, and permissions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download size={14} />
                  Export
                </Button>
                <Button
                  onClick={() => setShowAddEmployee(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Employee
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[calc(100%-80px)] overflow-y-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getTotalEmployees()}</p>
                    <p className="text-xs text-muted">Total Employees</p>
                  </div>
                </div>
                <p className="text-sm text-muted">All staff members</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <UserCheck size={20} className="text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getActiveEmployees()}</p>
                    <p className="text-xs text-muted">Active</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Currently working</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Clock size={20} className="text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getOnLeaveEmployees()}</p>
                    <p className="text-xs text-muted">On Leave</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Currently absent</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Star size={20} className="text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getAveragePerformance()}</p>
                    <p className="text-xs text-muted">Avg Rating</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Performance score</p>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <motion.div
                  key={employee.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-surface-200 rounded-xl border border-line p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary-600">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">{employee.name}</h3>
                        <p className="text-sm text-muted">{employee.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(employee.status)}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {employee.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Mail size={14} />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Phone size={14} />
                      {employee.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MapPin size={14} />
                      {employee.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                      {employee.role}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-sm font-medium">{employee.performance.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted">Hired</p>
                      <p className="font-medium">{employee.hireDate.toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-1 text-muted hover:text-primary-600 transition-colors"
                        title="Edit employee"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-1 text-muted hover:text-red-600 transition-colors"
                        title="Terminate employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted">
                <div className="text-center">
                  <Users size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No employees found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 p-6 bg-surface-200 rounded-xl border border-line">
              <h3 className="heading-sm text-ink mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <Calendar size={16} />
                  Schedule Management
                </Button>
                <Button variant="outline" className="gap-2">
                  <Award size={16} />
                  Performance Reviews
                </Button>
                <Button variant="outline" className="gap-2">
                  <Shield size={16} />
                  Permission Settings
                </Button>
                <Button variant="outline" className="gap-2">
                  <Target size={16} />
                  Training Programs
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
