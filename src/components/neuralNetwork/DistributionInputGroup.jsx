// DistributionInputGroup.jsx
import React from "react";

const DistributionInputGroup = ({
  distributionName,
  currentDistribution,
  paramDefs,
  values,
  onChange,
  isLoading,
}) => {
  if (currentDistribution !== distributionName.toLowerCase()) return null;

  return (
    <>
      {paramDefs.map(({ key, label, defaultValue = "" }) => (
        <tr key={key}>
          <td>{label}:</td>
          <td>
            <input
              type="number"
              value={values?.[key] ?? defaultValue}
              onChange={(e) =>
                onChange({
                  ...values,
                  [key]: e.target.value,
                })
              }
              step="0.1"
              disabled={isLoading}
            />
          </td>
        </tr>
      ))}
    </>
  );
};

export default DistributionInputGroup;
