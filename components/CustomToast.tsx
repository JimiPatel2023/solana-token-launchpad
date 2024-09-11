import React from 'react';
import { Toast, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface CustomToastProps {
  t: Toast;
  message: string;
  type: 'success' | 'error' | 'info';
}

const CustomToast: React.FC<CustomToastProps> = ({ t, message, type }) => {
  const bgColor = 
    type === 'success' ? 'bg-gradient-to-r from-green-400 to-green-600' :
    type === 'error' ? 'bg-gradient-to-r from-red-400 to-red-600' :
    'bg-gradient-to-r from-blue-400 to-blue-600';

  const icon = 
    type === 'success' ? '✅' :
    type === 'error' ? '❌' :
    'ℹ️';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center space-x-2`}
    >
      <span className="text-xl">{icon}</span>
      <p className="font-medium">{message}</p>
      <button onClick={() => toast.dismiss(t.id)} className="ml-auto text-white hover:text-gray-200">
        ✕
      </button>
    </motion.div>
  );
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.custom((t) => <CustomToast t={t} message={message} type={type} />);
};