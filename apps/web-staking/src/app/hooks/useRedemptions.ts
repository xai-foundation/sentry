import { useContext } from 'react';
import { RedemptionContext } from '../../context/redemptionsContext';

export const useRedemptions = () => {
  const context = useContext(RedemptionContext);
  if (!context) {
    throw new Error('useRedemption must be used within a RedemptionProvider');
  }
  return context;
};
