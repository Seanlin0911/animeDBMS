import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setPageTitle } from "../../features/common/headerSlice"
import TitleCard from "../../components/Cards/TitleCard"
import { Link, useParams } from "react-router-dom"
import SearchBar from "../../components/Input/SearchBar"
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon"
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon"
import ListBulletIcon from "@heroicons/react/24/outline/ListBulletIcon"
import axiosInstance from "../../app/axios"
import { openModal } from "../../features/common/modalSlice"
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil"

const TopSideButtons = ({ applyFilter }) => {
    const [filterParam, setFilterParam] = useState("Score")
    const locationFilters = ["Members", "Newest", "Score", "Title"]

    const showFiltersAndApply = (params) => {
        applyFilter(params)
        setFilterParam(params)
    }

    return (
        <div className="inline-block float-right">
            <div className="dropdown dropdown-bottom dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">
                    Sorted By {filterParam}
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 text-sm shadow bg-base-100 rounded-box w-52">
                    {locationFilters.map((l, k) => {
                        return (
                            <li key={k}>
                                <a onClick={() => showFiltersAndApply(l)}>{l}</a>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

const RatingButtons = ({ id, name, img, state }) => {
    const dispatch = useDispatch()
    const token = localStorage.getItem("token")
    const openAddRatingModal = () => {
        if (!token) {
            dispatch(
                openModal({
                    title: "You need to login",
                    bodyType: MODAL_BODY_TYPES.REQUIRE_LOGIN,
                })
            )
        } else {
            dispatch(
                openModal({
                    title: "Update Rating",
                    bodyType: MODAL_BODY_TYPES.RATING_ADD_NEW,
                    extraObject: { id: id, name: name, img: img, state: state },
                })
            )
        }
    }
    return (
        <div className="inline-block ">
            <button className="btn btn-sm normal-case" onClick={() => openAddRatingModal()}>
                Add Rating
            </button>
        </div>
    )
}

const WatchListButtons = ({ id, name, img, state }) => {
    const dispatch = useDispatch()
    const token = localStorage.getItem("token")
    const openAddWatchListModal = () => {
        if (!token) {
            dispatch(
                openModal({
                    title: "You need to login",
                    bodyType: MODAL_BODY_TYPES.REQUIRE_LOGIN,
                })
            )
        } else {
            dispatch(
                openModal({
                    title: "Update Watch Status",
                    bodyType: MODAL_BODY_TYPES.WATCHLIST_ADD_NEW,
                    extraObject: { id: id, name: name, img: img, state: state },
                })
            )
        }
    }

    return (
        <div className="inline-block ">
            <button className="btn btn-sm normal-case btn-primary" onClick={() => openAddWatchListModal()}>
                Add to WatchList
            </button>
        </div>
    )
}

const DetailCard = ({ detail }) => {
    const dispatch = useDispatch()

    if (!detail) {
        return <div>Loading...</div>
    }
    return (
        <div className="rounded-lg bg-base-100 shadow-md flex flex-col h-96">
            <div className="p-6 flex-grow">
                <Link to={"../details/" + detail["anime_id"]} className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{detail["Name"]}</h2>
                </Link>
                <hr className="my-4" />
                <div className="flex items-stretch">
                    <div className="w-2/5 max-w-2/5">
                        <Link to={"../details/" + detail["anime_id"]} className="flex items-center justify-between h-48">
                            <img src={detail["Image_URL"]} alt="圖片描述" className="w-full h-full object-cover rounded-lg" />
                        </Link>
                    </div>
                    <div className="w-3/5 px-4 overflow-y-auto max-h-48 ">
                        <p className="h-full break-words">{detail["Synopsis"]}</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mb-4 mr-4">
                <RatingButtons id={detail["Anime_id"]} name={detail["Name"]} img={detail["Image_URL"]} state={detail["Watch_Status"]} />
                <WatchListButtons id={detail["Anime_id"]} name={detail["Name"]} img={detail["Image_URL"]} state={detail["Watch_Status"]} />
            </div>
        </div>
    )
}

function InternalPage() {
    const dispatch = useDispatch()
    const [values, setValues] = useState([])
    const [genreName, setGenreName] = useState("")
    const { genre_id } = useParams("")
    const [genre_cnt, setGenre_cnt] = useState(0)
    const [compact, setCompact] = useState(false)
    const [inputPage, setInputPage] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState(localStorage.getItem("token"))
    const itemsPerPage = 48
    const [params, setParams] = useState("Score")
    const [display, setDisplay] = useState("Default")

    useEffect(() => {
        dispatch(setPageTitle({ title: "Search Anime" }))
        setToken(localStorage.getItem("token"))
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchData()
    }, [currentPage, params, display])

    useEffect(() => {
        axiosInstance
            .get(`/api/getGenreName/${genre_id}`)
            .then((res) => res.data)
            .then((data) => setGenreName(data[0]["Genre_name"]))
    }, [genre_id])

    useEffect(() => {
        axiosInstance
            .get(`/api/getGenresCnt/${genre_id}`, display)
            .then((res) => res.data)
            .then((data) => setGenre_cnt(data[0]["cnt"]))
        setTotalPages(Math.ceil(genre_cnt / itemsPerPage))
    }, [values, display])

    const fetchData = async () => {
        const startItem = (currentPage - 1) * itemsPerPage + 1
        const endItem = currentPage * itemsPerPage
        axiosInstance
            .get("api/getAnimesByGenre/" + genre_id + "/" + params + "/" + startItem + "/" + endItem, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            })
            .then((res) => {
                setValues(res.data)
                setLoading(false)
            })
            .catch((err) => {
                if (err.response.data === "Token expired" || err.response.data === "Token is invalid") {
                    localStorage
                        .removeItem("token")
                        .then(setToken(localStorage.getItem("token")))
                        .then(window.location.reload())
                }
            })
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    const applyFilter = (params) => {
        setParams(params)
    }

    // Search according to name
    const applySearch = (value) => {
        let filteredTransactions = values.filter((t) => {
            return t.email.toLowerCase().includes(value.toLowerCase()) || t.email.toLowerCase().includes(value.toLowerCase())
        })
        setValues(filteredTransactions)
    }

    if (!values) {
        return <div>Loading...</div>
    }

    const handleDisplayChange = () => {
        if (display === "Default") {
            setDisplay("Seen")
        } else if (display === "Seen") {
            setDisplay("NotSeen")
        } else {
            setDisplay("Default")
        }
    }

    return (
        <>
            <div className="flex p-2 mb-2 justify-between items-center">
                <div className="font-bold text-2xl">
                    {genreName} Anime ({genre_cnt})
                </div>
                <div className="flex items-center">
                    <button className=" outline outline-1  rounded-lg font-bold py-1 px-2 mx-2" onClick={handleDisplayChange}>
                        {display}
                    </button>
                    <TopSideButtons applyFilter={applyFilter} applySearch={applySearch} />
                    <button className="mx-2" onClick={() => setCompact(!compact)}>
                        {compact ? <ListBulletIcon className="h-6 w-6" /> : <Squares2X2Icon className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            <div className="divider" />
            {!compact ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {values &&
                        values.map((value, index) => {
                            return <DetailCard key={index} detail={value} />
                        })}
                </div>
            ) : (
                <table className="table w-full table-compact shadow-2xl">
                    <thead className="rounded">
                        <tr>
                            <th>Title</th>
                            <th>Score</th>
                            <th>Watch Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {values &&
                            values.map((l, k) => {
                                return (
                                    <tr key={k}>
                                        <td>
                                            <div className="flex h-20">
                                                <img className="h-full" src={l.Image_URL} alt={l.Name} />
                                                <div className="mx-5 my-2 font-bold">{l.Name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-bold">⭐{l.Score}</div>
                                        </td>
                                        <td>
                                            <WatchListButtons
                                                id={l["Anime_id"]}
                                                name={l["Name"]}
                                                img={l["Image_URL"]}
                                                state={l["Watch_Status"]}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            )}
            <div className="flex justify-center mt-4">
                <div className="btn-group">
                    <button className="btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        «
                    </button>

                    <button className="btn" onClick={() => setInputPage(currentPage)}>
                        Page {currentPage}
                    </button>

                    <button className="btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        »
                    </button>
                </div>
            </div>
        </>
    )
}

export default InternalPage
