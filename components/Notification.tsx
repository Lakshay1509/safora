'use client'
import RightSidebar from '@/app/community/components/RightSidebar';
import AvatarCircle from '@/app/profile/components/AvatarCircle';
import { useNotifications } from '@/hooks/useNotification';
import { headingsPlugin, MDXEditor } from '@mdxeditor/editor';
import { ArrowLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'

const Notification = () => {
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  return (
    <>
      <section className="max-w-4xl py-4 px-4 sm:px-6">

        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-center flex text-xl justify-center items-center"><span><ArrowLeftCircle size={30} className='mr-5 bg-gray-300 rounded-full hover:scale-105 transition-all hover:cursor-pointer'onClick={()=>{router.push('/community')}}/></span>Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className=" overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              
              <div
              key={notification.id}
                className={` p-4 border-b hover:bg-gray-50 cursor-pointer ${notification.is_read === 0 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className='flex justify-start items-center space-x-2'>
                {/* <AvatarCircle url={notification.sender?.profile_url} name={notification.sender?.name} size='40'/> */}

                <MDXEditor
                  markdown={notification.text}
                  readOnly={true}
                  plugins={[

                    headingsPlugin(),

                  ]}
                />
                </div>
                 <p className="text-xs text-gray-500 mt-3">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
                
              </div>
             
               
            ))
            
            
          )}
        </div>
      </section>
      <div className="hidden lg:block w-80 p-4">
        <RightSidebar />
      </div>
    </>
  )
}

export default Notification