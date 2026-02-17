import axiosInstance from '../../../axiosInstance.jsx'



export const getAllCreditTransactions = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/transactions/credit`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllCreditTransactions:", error);
    return { status: 'error', data: [] };
  }
}
export const getAllDebitTransactions = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/transactions/debit`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllDebitTransactions:", error);
    return { status: 'error', data: [] };
  }
}
export const getTransactionReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/transactions/report`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching report:", error);
    return { status: 'error', data: [] };
  }
}
export const addBankAccount = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/bank-accounts/add`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding bank account:", error);
    return { status: 'error', data: [] };
  }
}
export const getBankAccount = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/bank-accounts/user/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return { status: 'error', data: [] };
  }
}
export const settleAmountToSeller = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/api/transactions/settle/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error settling amount to seller:", error);
    return { status: 'error', data: [] };
  }
}