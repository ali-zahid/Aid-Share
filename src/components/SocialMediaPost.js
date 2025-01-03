import React, { useRef } from 'react'
import logo from './logo.png'
import html2canvas from 'html2canvas'

//Link for dowbllading image: https://dev.to/smpnjn/how-to-save-html-canvas-as-an-image-38dh

const SocialMediaPost = ({ description, amount }) => {
  const ref = useRef(null)

  const handleDownload = async () => {
    if (ref.current) {
      const canvas = await html2canvas(ref.current, {
        scale: 5, // Adjust for higher resolution
        logging: true, // Enable log for debugging
        useCORS: true, // Allow images to be loaded cross-origin
      })
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = 'SocialMediaPost.png' // Name the image
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      console.log('Element not found or not rendered yet')
    }
  }
  return (
    <div>
      <div
        className=' size-[690px] flex flex-col gap-[40px] px-10 justify-start items-center bg-[radial-gradient(circle,_#404040_-30%,_#000000_100%)]'
        ref={ref}
      >
        <img
          src={logo}
          alt='Helping Hand Foundation Logo'
          className='h-40 brightness-125 mt-[40px]'
        />
        <p className='text-white text-center p-3'>
          {description}
          <br />
          Any contribution, big or small, would be immensely appreciated.
        </p>
        <div className='bg-[#007964] h-8 w-auto gap-1 text-white rounded-full ml-auto flex justify-center items-center px-4'>
          Required Amount: <span className='font-bold'>{amount}</span>
        </div>
        <div className='text-white mr-auto'>
          <p>Bank: </p>
          <p>Name:</p>
          <p>Account Number: </p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className='px-4 py-2 mt-4 rounded bg-green-500 text-white'
      >
        Download
      </button>
    </div>
  )
}

export default SocialMediaPost
