import React from "react";

export function NumberField({label,value,onChange,placeholder}){
  return (
    <label className="block text-sm">
      {label}
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border px-3 py-2"
      />
    </label>
  );
}

export function SelectField({label,value,onChange,options}){
  return (
    <label className="block text-sm">
      {label}
      <select
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-2 py-2"
      >
        {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
