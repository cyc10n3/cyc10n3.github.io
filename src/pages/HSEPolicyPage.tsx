import React from 'react';

const HSEPolicyPage: React.FC = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Safety, Health & Environment Policy
          </h1>
        </div>

        {/* Policy Statement */}
        <section className="mb-12">
          <div className="bg-blue-50 rounded-lg p-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              At WellHead, our policy is Safety First. We believe that all safety, health and environment issues are preventable and we will always strive to lead the way in our sector.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Wellhead is committed to:</h3>
            
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Protect the environment by preventing pollution, conserving resources, carefully handling and disposing of hazardous wastes in an eco-friendly manner, and reusing and recycling materials wherever possible.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Create an environment to avoid hazards, reduce risks, prevent ill-health, and build an accident-free work environment by taking proactive measures.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Conduct all activities such that no harm comes to our employees, contractors and community while creating a culture of learning.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Provide continuous training to employees and associates to upgrade their awareness and skills for a better Safety, Health and Environment (SHE) Management System.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Utilize energy resources in a responsible and efficient manner to reduce emissions, effluents and waste generation.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Build an environment where there is consciousness towards products manufactured and distributed that strictly adhere to local and international standards and regulations.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Adhere to all legal and statutory requirements concerning Safety, Occupational Health and Environment.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Continually improve our processes to enhance Safety, Health and Environment performance internally and among interested parties and the community.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Additional Policy Content */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              We will ensure that we inculcate a strong culture of designing for Efficiency, Ergonomics and Environment in our Projects, Products and Processes.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              We ensure that this policy is communicated to every employee with refreshers and that it is available for viewing by the public and other stakeholders. It will be effectively reviewed periodically, taking into account our learnings from audits and incidents, their investigations and interactions, with precise time-bound implementation. We are committed to creating a culture of systems and processes that will always prioritize safety, health and the environment.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HSEPolicyPage;