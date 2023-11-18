// chartDate.js

const Order = require('../models/orderModel'); // Import your Order model or adjust the path as needed



const getMonthlyDataArray = async () => {
  const currentDate = new Date();
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

  const monthlyOrders = await Order.aggregate([
    {
      $match: {
        paymentStatus:"Payment Successful",
        orderDate: { $gte: sevenMonthsAgo, $lte: currentDate }
      }
    },
    {
      $group: {
        _id: { $month: '$orderDate' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const monthlyDataArray = [];
  for (let i = 6; i >= 0; i--) {
    const monthIndex = (currentDate.getMonth() - i + 12) % 12 + 1;
    const foundMonth = monthlyOrders.find(order => order._id === monthIndex);
    const count = foundMonth ? foundMonth.count : 0;
    monthlyDataArray.push({ month: monthIndex, count });
  }

  return monthlyDataArray;
};

const getDailyDataArray = async () => {
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate);
  sevenDaysAgo.setDate(currentDate.getDate() - 7);

  const dailyOrders = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: sevenDaysAgo, $lte: currentDate }
      }
    },
    {
      $group: {
        _id: { $dayOfMonth: '$orderDate' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const dailyDataArray = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(currentDate);
    day.setDate(currentDate.getDate() - i);

    const foundDay = dailyOrders.find(order => order._id === day.getDate());
    const count = foundDay ? foundDay.count : 0;
    dailyDataArray.push({ day: day.getDate(), count });
  }

  return dailyDataArray;
};

const getYearlyDataArray = async () => {
  const currentDate = new Date();
  const sevenYearsAgo = new Date(currentDate);
  sevenYearsAgo.setFullYear(currentDate.getFullYear() - 7);

  const yearlyOrders = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: sevenYearsAgo, $lte: currentDate }
      }
    },
    {
      $group: {
        _id: { $year: '$orderDate' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const yearlyDataArray = [];
  for (let i = 6; i >= 0; i--) {
    const year = currentDate.getFullYear() - i;

    const foundYear = yearlyOrders.find(order => order._id === year);
    const count = foundYear ? foundYear.count : 0;
    yearlyDataArray.push({ year, count });
  }

  return yearlyDataArray;
};

module.exports = { getMonthlyDataArray, getDailyDataArray, getYearlyDataArray };
