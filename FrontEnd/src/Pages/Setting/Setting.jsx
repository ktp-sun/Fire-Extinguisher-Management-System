import React from "react";
import 'boxicons';
import './Setting.css'

const Setting = () => {
  return (
    <div className="setting-container bg-white p-2 rounded-lg drop-shadow">
      <label className="bg-white rounded flex p-1 justify-between w-full hover:brightness-90 items-center" htmlFor="dark-mode">
        <span className="flex justify-center w-full items-center gap-2">
        <box-icon name="moon" color="#473366" size="sm" ></box-icon>
        <span className="w-full text-secondary text-2xl">Dark Mode</span>
        </span>
        <input type="checkbox" name="dark-mode" id="dark-mode" />
      </label>
    </div>
  );
};

export default Setting;
