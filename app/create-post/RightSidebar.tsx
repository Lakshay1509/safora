'use client'

import React, { useState } from 'react'

const RightSidebar = () => {
  const [openGuideline, setOpenGuideline] = useState<string | null>(null)

  const toggleGuideline = (id: string) => {
    setOpenGuideline(openGuideline === id ? null : id)
  }

  const guidelines = [
    {
      id: 'respectful',
      title: 'Be Respectful',
      content: 'Treat others with kindness and respect. No hate speech or harassment.'
    },
    {
      id: 'on-topic',
      title: 'Stay On Topic',
      content: 'Keep posts relevant to the community\'s purpose and interests.'
    },
    {
      id: 'no-spam',
      title: 'No Spam',
      content: 'Avoid repetitive posts and unsolicited promotions.'
    },
    {
      id: 'no-promotion',
      title: 'No Promotion',
      content: 'Self-promotion and advertising are not allowed without prior approval.'
    },
    {
      id: 'original',
      title: 'Original Content',
      content: 'Give credit where it\'s due and respect intellectual property.'
    },
    {
      id: 'report',
      title: 'Report Issues',
      content: 'Help us maintain a safe community by reporting violations.'
    }
  ]

  return (
     <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:block hidden">
          Community Guidelines
        </h2>
        
        {/* Each Guideline as Dropdown */}
        <div className="space-y-2">
          {guidelines.map((guideline) => (
            <div key={guideline.id} className="border-b border-gray-200 pb-2">
              <button
                onClick={() => toggleGuideline(guideline.id)}
                className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <h3 className="font-medium text-gray-900">{guideline.title}</h3>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    openGuideline === guideline.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openGuideline === guideline.id ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-gray-600 px-2">{guideline.content}</p>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

export default RightSidebar