import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from '../../components/Cards/TitleCard'
import { Link, useParams } from 'react-router-dom'
import SearchBar from "../../components/Input/SearchBar"
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon'
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon'
import axiosInstance from '../../app/axios'
import { openModal } from '../../features/common/modalSlice'
import {  MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'


const TopSideButtons = ({removeFilter, applyFilter, applySearch}) => {

    const [filterParam, setFilterParam] = useState("Members")
    const [searchText, setSearchText] = useState("")
    const locationFilters = ["Members", "Newest", "Score", "Title"]

    const showFiltersAndApply = (params) => {
        applyFilter(params)
        setFilterParam(params)
    }

    const removeAppliedFilter = () => {
        removeFilter()
        setFilterParam("")
        setSearchText("")
    }

    useEffect(() => {
        if(searchText == ""){
            removeAppliedFilter()
        }else{
            applySearch(searchText)
        }
    }, [searchText])

    return(
        <div className="inline-block float-right">
            {/*<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText}/>*/}
            {/*filterParam !== "" && <button onClick={() => removeAppliedFilter()} className="btn btn-xs mr-2 btn-active btn-ghost normal-case">{filterParam}<XMarkIcon className="w-4 ml-2"/></button>*/}
            <div className="dropdown dropdown-bottom dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">Sorted By {filterParam}</label>
                <ul tabIndex={0} className="dropdown-content menu p-2 text-sm shadow bg-base-100 rounded-box w-52">
                    {
                        locationFilters.map((l, k) => {
                            return  <li key={k}><a onClick={() => showFiltersAndApply(l)}>{l}</a></li>
                        })
                    }
                    <div className="divider mt-0 mb-0"></div>
                    <li><a onClick={() => removeAppliedFilter()}>Remove Filter</a></li>
                </ul>
            </div>
        </div>
    )
}

const WatchListButtons = ({id,name,img,state}) => {

    const dispatch = useDispatch()
    const token = localStorage.getItem('token')
    const openAddWatchListModal = () => {
        if(!token){
            dispatch(openModal({title : "You need to login", bodyType : MODAL_BODY_TYPES.REQUIRE_LOGIN}))
        }else{
            dispatch(openModal({title : "Update Watch Status", bodyType : MODAL_BODY_TYPES.WATCHLIST_ADD_NEW,extraObject:{"id":id,"name":name,"img":img,"state":state}}))
        }
    }

    return(
        <div className="inline-block ">
            <button className="btn btn-sm normal-case btn-primary" onClick={() => openAddWatchListModal()}>Add to WatchList</button>
        </div>
    )
}


const DetailCard = ({detail}) => {

    const dispatch = useDispatch()


    if(!detail) {return <div>Loading...</div>}
    return(
        <div className="rounded-lg bg-base-100 shadow-md flex flex-col">
            <div className="p-6 flex-grow">
                <Link to={"../details/"+detail["anime_id"]} className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{detail["Name"]}</h2>
                </Link>
                <hr className="my-4" />
                <div className="flex items-stretch">
                    <div className="w-2/5 max-w-2/5">
                        <Link to={"../details/"+detail["anime_id"]} className="flex items-center justify-between">
                            <img src={detail["Image_URL"]} alt="圖片描述" className="w-full h-full object-cover rounded-lg" />
                        </Link>
                    </div>
                    <div className="w-3/5 px-4">
                        <p className="h-full">文字描述文字描述文字描述文字描述文字描述文字描述</p>
                    </div>
                </div>

            </div>
            <div className="flex justify-end mb-4 mr-4">
                <WatchListButtons id={detail["Anime_id"]} name={detail["Name"]} img={detail["Image_URL"]} state={detail["Watch_Status"]}/>
            </div>
            
        </div>

    )
}



function InternalPage(){    

    const dispatch = useDispatch()
    const [values, setValues] = useState()
    const [genreName, setGenreName] = useState()
    const {genre_id, page } = useParams()
    const [genre_cnt, setGenre_cnt] = useState()
    const [compact, setCompact] = useState(false)

    useEffect(() => {
        dispatch(setPageTitle({ title : "Home Page"}))
      }, [])
    
    useEffect(() => {
        axiosInstance.get(`/api/getGenreName/${genre_id}`).then(res => res.data).then(data => setGenreName(data[0]["Genre_name"]));
    }, [genre_id])

    useEffect(() => {
        axiosInstance.get('/api/getAnimes').then(res => res.data).then(data => setValues(data));
        axiosInstance.get(`/api/getGenresCnt/${genre_id}`).then(res => res.data).then(data => setGenre_cnt(data[0]["cnt"]));
    }  ,[])


    const removeFilter = () => {
        axiosInstance.get('/api/getAnimes').then(res => res.data).then(data => setValues(data));
    }
    

    const applyFilter = (params) => {
        let filteredTransactions = values.filter((t) => {return t.location == params})
        setValues(filteredTransactions)
    }

    // Search according to name
    const applySearch = (value) => {
        let filteredTransactions = values.filter((t) => {return t.email.toLowerCase().includes(value.toLowerCase()) ||  t.email.toLowerCase().includes(value.toLowerCase())})
        setValues(filteredTransactions)
    }
    
    if(!values){
        return <div>Loading...</div>
    }

    return(
        <>
            <div className='flex p-2 mb-2 justify-between items-center'>
                <div className='font-bold text-2xl'>{genreName} Anime ({genre_cnt})</div>
                <div className='flex items-center'>
                    <TopSideButtons removeFilter={removeFilter} applyFilter={applyFilter} applySearch={applySearch}/>
                    <button className='mx-2' onClick={()=>setCompact(!compact)}>{compact?<ListBulletIcon className='h-6 w-6' />:<Squares2X2Icon className='h-6 w-6' />}</button>
                </div>
            </div>
            <div className='divider' />
            {!compact ?
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {values && values.map((value, index) => {
                        return <DetailCard  key={index} detail={value} />
                    })}
                </div>
                :
                <table className="table w-full table-compact shadow-2xl">
                    <thead className='rounded'>
                        <tr>
                            <th>Title</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        { values &&
                            values.map((l, k) => {
                                return(
                                    <tr key={k}>
                                        <td><div className='flex h-20'><img className='h-full' src={l.Image_URL} alt={l.Name} /><div className='mx-5 my-2 font-bold'>{l.Name}</div></div></td>
                                        <td><div className="font-bold">⭐{l.Score}</div></td> 
                               
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

            }
        </>
    )
}

export default InternalPage