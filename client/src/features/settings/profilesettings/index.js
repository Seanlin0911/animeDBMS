import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import TitleCard from "../../../components/Cards/TitleCard"
import { showNotification } from "../../common/headerSlice"
import axiosInstance from "../../../app/axios"

function ProfileSettings() {
    const dispatch = useDispatch()
    const token = localStorage.getItem("token")
    const [profile, setProfile] = useState({})

    const getProfile = async () => {
        try {
            const response = await axiosInstance.get("/api/getProfile", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            })
            const profileData = response.data
            profileData.Birthday = moment(profileData.Birthday).format("YYYY-MM-DD")
            setProfile(profileData)
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const errorMessage = error.response.data
                if (errorMessage === "Token expired") {
                    console.log("Token expired. Logging out...")
                    localStorage.removeItem("token")
                    dispatch(showNotification({ message: "Token expired. Logging out...", status: 0 }))
                    //window.location.href = "/app/welcome"
                } else {
                    console.log("Other 401 error:", errorMessage)
                }
            } else {
                console.error("Error:", error)
            }
        }
    }

    useEffect(() => {
        getProfile()
    }, [])

    const handleGenderChange = (event) => {
        const genderValue = event.target.value
        setProfile({ ...profile, Gender: genderValue })
    }

    const handleBirthdayChange = (event) => {
        const birthdayValue = event.target.value
        setProfile({ ...profile, Birthday: birthdayValue })
    }

    const updateProfile = async () => {
        const updateProfile = {
            gender: profile["Gender"],
            birthday: profile["Birthday"],
        }
        console.log(updateProfile)
        try {
            await axiosInstance.post("/api/updateProfile", updateProfile, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            })
            dispatch(showNotification({ message: "Profile updated", status: 1 }))
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const errorMessage = error.response.data
                if (errorMessage === "Token expired") {
                    console.log("Token expired. Logging out...")
                    localStorage.removeItem("token")
                    dispatch(showNotification({ message: "Token expired. Logging out...", status: 0 }))
                    //window.location.href = "/app/welcome"
                } else {
                    console.log("Other 401 error:", errorMessage)
                }
            } else {
                console.error("Error:", error)
            }
            dispatch(showNotification({ message: "Error updating profile", status: 0 }))
        }
    }

    return (
        <>
            {profile && profile.Username && (
                <div>
                    <TitleCard title={`${profile.Username}'s Profile Settings`} topMargin="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span>Gender</span>
                                </label>
                                <select
                                    value={profile.Gender}
                                    onChange={handleGenderChange}
                                    className="select block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span>Birthday</span>
                                </label>
                                <input
                                    type="date"
                                    value={profile.Birthday}
                                    onChange={handleBirthdayChange}
                                    className="select block w-full  border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-5">
                            <button className="btn btn-primary float-right" onClick={updateProfile}>
                                Update
                            </button>
                        </div>
                    </TitleCard>
                    <TitleCard title="Change Password" topMargin="mt-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span>Old Password</span>
                                </label>
                                <input type="password" placeholder="Old Password" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span>New Password</span>
                                </label>
                                <input type="password" placeholder="New Password" className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span>Check Password</span>
                                </label>
                                <input type="password" placeholder="Double" className="input input-bordered" />
                            </div>
                        </div>

                        <div className="mt-5">
                            <button className="btn btn-primary float-right">Change</button>
                        </div>
                    </TitleCard>
                    <TitleCard title="Delete Account" topMargin="mt-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span>Confirm Password</span>
                                </label>
                                <input type="password" placeholder="Password" className="input input-bordered" />
                            </div>
                        </div>

                        <div className="mt-5">
                            <button className="btn btn-primary float-right">Delete</button>
                        </div>
                    </TitleCard>
                </div>
            )}
        </>
    )
}

export default ProfileSettings
