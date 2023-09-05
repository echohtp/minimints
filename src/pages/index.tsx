import Head from 'next/head'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { NFTStorage } from 'nft.storage'
import { toast } from 'react-toastify'
import { Fragment, useState } from 'react'
import { Button } from 'antd'

const nftstorage = new NFTStorage({ token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY! })

export default function Home() {

  async function mintAction(wallet: WalletContextState, name: string, description: string, file: any) {

    if (!wallet.connected || !wallet.publicKey || !file[0])
      return


    setActionState("Loading")
    setLoading(true)

    try {
      const config = {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_UNDERDOG_API_KEY!}` }
      }

      const cid = await nftstorage.storeBlob(file[0])
      console.log(cid)

      const nftdata = {
        name,
        description,
        symbol: "",
        image: `https://ipfs.io/ipfs/${cid}`,
        receiverAddress: wallet.publicKey.toBase58()
      }

      let createNftResponse
      for (var i = 0; i < count; i++) {
        createNftResponse = await axios.post(`${process.env.NEXT_PUBLIC_UNDERDOG_ENDPOINT}/v2/projects/${process.env.NEXT_PUBLIC_UNDERDOG_PROJECT_ID!}/nfts`, nftdata, config)
        // successful
        if ([200, 202].includes(createNftResponse.status)) {
          toast.success("Mint successful!", {
            position: toast.POSITION.BOTTOM_CENTER
          })
        }

        //error
        if ([400, 401].includes(createNftResponse.status)) {
          toast.error("There was an error.", {
            position: toast.POSITION.BOTTOM_CENTER
          })
        }
      }
      setActionState("Success")
      setLoading(false)
    } catch {
      toast.error("There was an error.", {
        position: toast.POSITION.BOTTOM_CENTER
      })
      setLoading(false)
    }
  }


  const wallet = useWallet()

  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [file, setFile] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [actionState, setActionState] = useState<"Success" | "Error" | "Loading" | "Waiting">("Waiting")
  const [count, setCount] = useState<number>(1)


  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <!-- this will use the whole viewport even in mobile --> */}
      <div className="absolute inset-0">
        <div className='text-center mt-4'>
          <WalletMultiButton />
          {wallet.connected &&
            <>
              <div className='justify-center items-center text-center px-4 mx-auto pt-10'>
                <div>
                  <input type="file" accept="image/*;capture=camera" onChange={(e) => { setFile(e.target.files) }}></input>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Best name ever"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      name="description"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Write that description prose here"
                    />
                  </div>
                </div>

                 

                        <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Count
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      name="count"
                      id="count"
                      value={count}
                      onChange={(e) => {
                        if (Number(e.target.value) > 0)
                          setCount(Number(e.target.value))
                      }}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                

                <div className='py-2'>
                  <Button
                    loading={loading}
                    type="primary"
                    size='large'
                    shape='round'
                    onClick={async () => {
                      await mintAction(wallet, name, description, file)

                    }}
                  >
                    Mint
                  </Button>
                </div>

              </div >
            </>
          }
          {!wallet.connected && <>not connected</>}
        </div>
      </div>
    </>
  )
}
