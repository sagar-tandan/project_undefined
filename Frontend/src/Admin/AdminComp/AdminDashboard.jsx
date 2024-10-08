import React, { useContext, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components (scales, elements, and plugins)
ChartJS.register(
  CategoryScale, // For x-axis scale
  LinearScale, // For y-axis scale
  BarElement, // For bar chart
  Title,
  Tooltip,
  Legend
);
import { MdAdminPanelSettings } from "react-icons/md";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { GiBlackBook } from "react-icons/gi";
import { CgGym } from "react-icons/cg";
import { formatDistanceToNow } from "date-fns";
import { AllContext } from "../../Context/Context";
import axios from "axios";
import Calendar from "./Calander";
// import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [lastLogin, setLastLogin] = useState("");
  const { active, setActive } = useContext(AllContext);
  const { dashboardDetail, setDashboardDetail } = useContext(AllContext);
  const [recentMembers, setRecentMembers] = useState([]);
  const [topPlans, setTopPlans] = useState([]);
  const [topPlanData, setTopPlanData] = useState({
    labels: [],
    datasets: [
      {
        label: "Top Plans",
        data: [],
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const storedLoginDate = localStorage.getItem("loginDate");
    if (storedLoginDate) {
      const loginDate = new Date(storedLoginDate);
      const timeAgo = formatDistanceToNow(loginDate, { addSuffix: true });
      setLastLogin(timeAgo);
    } else {
      setLastLogin("No login data available");
    }
    fetchDetails();
    fetchNewMembers();
    fetchTopPlans();
  }, []);

  const fetchDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5002/api/dashboard");
      console.table(response.data);
      setDashboardDetail(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchNewMembers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5002/api/dashboard/newRegistered"
      );
      console.table(response.data);
      setRecentMembers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTopPlans = async () => {
    const response = await axios.get(
      "http://localhost:5002/api/dashboard/top5Plans"
    );
    console.table(response.data);
    setTopPlans(response.data);
  };

  useEffect(() => {
    if (topPlans && topPlans.length > 0) {
      let labels = [];
      let data = [];
      topPlans.forEach((plan) => {
        labels.push(plan.plan.name);
        data.push(plan.memberRegistrationCount);
      });

      // Update the chart data
      setTopPlanData({
        labels,
        datasets: [
          {
            label: "Total Members",
            data,
            backgroundColor: "rgba(153,102,204, 0.5)",
            borderColor: "rgba(120,81,169, 1)",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [topPlans]);

  return (
    <div className="w-full flex flex-col text-gray-900 px-3 gap-2 mt-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-4 font-nunito ">
        {/* Admin Profile Summary */}

        <div
          onClick={() => {
            setTimeout(() => {
              setActive("admin");
              localStorage.setItem("active", "admin");
            }, 100);
          }}
          className="bg-purple-100 px-6 rounded-lg shadow-lg flex items-center justify-between py-4 hover:bg-purple-900 hover:text-white group transition-all duration-300 ease-in-out hover:-translate-y-2 cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold font-nunito">Admin Profile</h2>
            <p className="text-lg font-nunito">
              {localStorage.getItem("username")}
            </p>
            <p>
              Last Login:{" "}
              <span className="text-gray-500 group-hover:text-[#c1c1c1]">
                {lastLogin}
              </span>
            </p>
          </div>
          <MdAdminPanelSettings className="text-purple-700 w-9 h-9 group-hover:text-white" />
        </div>

        <div
          onClick={() => {
            setTimeout(() => {
              setActive("register");
              localStorage.setItem("active", "register");
            }, 100);
          }}
          className="bg-purple-100 px-6 rounded-lg shadow-lg flex items-center justify-between py-4 hover:bg-purple-900 hover:text-white group transition-all duration-300 ease-in-out hover:-translate-y-2 cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold font-nunito">Members</h2>

            <p>
              Total Members:{" "}
              <span className="text-gray-500 group-hover:text-white font-bold">
                {dashboardDetail && dashboardDetail.totalMember}
              </span>
            </p>
            <p>
              New Today:{" "}
              <span className="text-green-500 font-bold">
                {dashboardDetail && dashboardDetail.todayRegistered}
              </span>
            </p>
          </div>
          <MdOutlinePeopleAlt className="text-purple-700 w-9 h-9 group-hover:text-white" />
        </div>

        {/* Plans Summary */}

        <div
          onClick={() => {
            setTimeout(() => {
              setActive("plan");
              localStorage.setItem("active", "plan");
            }, 100);
          }}
          className="bg-purple-100 px-6 rounded-lg shadow-lg flex items-center justify-between py-4 hover:bg-purple-900 hover:text-white group transition-all duration-300 ease-in-out hover:-translate-y-2 cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold font-nunito">Plan</h2>

            <p>
              Total Plans:{" "}
              <span className="text-gray-500 group-hover:text-white font-bold">
                {dashboardDetail && dashboardDetail.totalPlan}
              </span>
            </p>
            <p>
              Popular:{" "}
              <span className="font-bold text-green-500">
                {dashboardDetail && dashboardDetail.planWithHighestCount}
              </span>
            </p>
          </div>
          <GiBlackBook className="text-purple-700 w-9 h-9 group-hover:text-white" />
        </div>

        {/* Inventory Summary */}

        <div
          onClick={() => {
            setTimeout(() => {
              setActive("inventory");
              localStorage.setItem("active", "inventory");
            }, 100);
          }}
          className="bg-purple-100 px-6 rounded-lg shadow-lg flex items-center justify-between py-4 hover:bg-purple-900 hover:text-white group transition-all duration-300 ease-in-out hover:-translate-y-2 cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold font-nunito">Inventory</h2>

            <p>
              Total Items:{" "}
              <span className="text-gray-500 group-hover:text-white font-bold">
                {dashboardDetail && dashboardDetail.totalEquip}
              </span>
            </p>
            <p>
              Defect items:{" "}
              <span className="font-bold text-red-500">
                {dashboardDetail && dashboardDetail.defectEquip}
              </span>
            </p>
          </div>
          <CgGym className="text-purple-700 w-9 h-9 group-hover:text-white" />
        </div>
      </div>

      {/* Simple Bar Chart */}

      <div className="w-full flex gap-3">
        <div className="bg-white p-3 rounded-lg mb-2 w-full ">
          <h2 className="text-xl font-bold font-nunito mb-4">Top 5 Plans</h2>
          <Bar data={topPlanData} />
        </div>
        <div className="bg-white p-3 py-6 rounded-lg w-full ">
          {/* <h2 className="text-xl font-semibold mb-3"></h2> */}
          <Calendar />
        </div>
      </div>

      <section className="w-full py-1 px-1 relative pb-10">
        <h1 className="font-bold font-nunito mb-3 text-xl">
          Newly Registered Members
        </h1>
        <table className="w-full">
          <thead>
            <tr className="w-full border-[1px] border-purple-200 bg-purple-100 rounded-sm">
              <th className="font-medium text-left pl-4 py-2 text-[#636363]">
                Card No.
              </th>
              <th className="font-medium text-left pl-4 py-2 text-[#636363]">
                Member Name
              </th>
              <th className="font-medium text-left pl-4 py-2 text-[#636363]">
                Contact
              </th>
              <th className="font-medium text-left pl-4 py-2 text-[#636363]">
                Enrolled Date
              </th>
              <th className="font-medium text-left pl-4 py-2 text-[#636363]">
                Expiration Date
              </th>
            </tr>
          </thead>

          <tbody>
            {recentMembers.length > 0 &&
              recentMembers.map((member, index) => (
                <tr key={index} className={`border-[1px] border-purple-200`}>
                  <td className="py-3 px-5 font-medium text-black">
                    {member.cardNo}
                  </td>
                  <td className="py-3 px-5 font-normal text-[#636363]">
                    {member.memberName}
                  </td>
                  <td className="py-3 px-5 font-normal text-[#636363]">
                    {member.contact}
                  </td>

                  <td className="py-3 px-5 font-normal text-[#636363]">
                    {member.enrolledDate}
                  </td>

                  <td className="py-3 px-5 font-normal text-[#636363]">
                    {member.expiryDate}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
