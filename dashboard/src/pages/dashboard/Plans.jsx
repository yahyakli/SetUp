import { useState } from 'react';
import axios from 'axios';
import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import { BILLING_SERVICE_URL } from '../../../constants';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PlanFormModal from '../../components/plans/PlanFormModal';
import DeleteConfirmationModal from '../../components/plans/DeleteConfirmationModal';

const Plans = () => {
  const { plans, loadingPlans, setPlans } = useApp();
  const { token } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultFormData = {
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    special_title: '',
    projects: 0,
    teams: 0,
    chat: false,
    priority: false,
    analytics: false,
    security: false,
    is_active: true
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BILLING_SERVICE_URL}/api/plans/${selectedPlan.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPlans(plans.filter(p => p.id !== selectedPlan.id));
      toast.success('Plan deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleCreatePlan = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(BILLING_SERVICE_URL + '/api/plans', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setPlans([...plans, response.data.plan]);
        toast.success('Plan created successfully');
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.put(`${BILLING_SERVICE_URL}/api/plans/${selectedPlan.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setPlans(plans.map(p => p.id === selectedPlan.id ? response.data.plan : p));
        toast.success('Plan updated successfully');
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Plan Name' },
    {
      key: 'price',
      label: 'Price',
      render: (plan) => {
        return `$${plan.price}/${plan.billing_cycle || 'month'}`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (plan) => {
        const status = plan.is_active ? 'Active' : 'Inactive';
        let statusClass = status === 'Active' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {status}
          </span>
        );
      }
    },
    { key: 'description', label: 'Description' },
    {
      key: 'actions',
      label: 'Actions',
      render: (plan) => {
        return (
          <div className="flex space-x-2">
            <button 
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleEdit(plan)}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => handleDelete(plan)}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plans</h1>
        <button
          className="btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          Add Plan
        </button>
      </div>

      <DataTable
        columns={columns}
        data={plans}
        title="Subscription Plans"
        pagination={true}
        itemsPerPage={8}
        loading={loadingPlans}
      />

      {/* Add Plan Modal */}
      {showAddModal && (
        <PlanFormModal
          initialData={defaultFormData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreatePlan}
          title="Add New Plan"
          loading={loading}
        />
      )}

      {/* Edit Plan Modal */}
      {showEditModal && (
        <PlanFormModal
          initialData={selectedPlan}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdatePlan}
          title="Edit Plan"
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          plan={selectedPlan}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Plans; 