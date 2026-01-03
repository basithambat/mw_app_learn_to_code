import { supabase } from "@/config/supabase";
import APIService, { APICaller } from "./APIKit";

export const storeUser = async (userInfo: any, loginType: 'via google' | 'via phone') => {
    try {
        // Handle different userInfo structures (Google vs Phone)
        let userinfo;
        
        if (userInfo?.data?.user) {
            // Google login structure
            userinfo = {
                first_name: userInfo.data.user.givenName || '',
                last_name: userInfo.data.user.familyName || '',
                name: userInfo.data.user.name || '',
                email: userInfo.data.user.email || '',
                pic: userInfo.data.user.photo || '',
                login_through: loginType
            };
        } else if (userInfo?.user) {
            // Alternative structure
            userinfo = {
                first_name: userInfo.user.givenName || userInfo.user.first_name || '',
                last_name: userInfo.user.familyName || userInfo.user.last_name || '',
                name: userInfo.user.name || '',
                email: userInfo.user.email || '',
                pic: userInfo.user.photo || userInfo.user.pic || '',
                login_through: loginType
            };
        } else {
            // Direct structure (already formatted)
            userinfo = {
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                name: userInfo.name || '',
                email: userInfo.email || '',
                pic: userInfo.pic || userInfo.photo || '',
                login_through: loginType
            };
        }

        // Find user in the database
        const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', userinfo.email)
            .maybeSingle();  // Use `.maybeSingle()` to handle no results gracefully

        if (existingUser) {
            // Update existing user if needed
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    name: userinfo.name,
                    pic: userinfo.pic,
                    login_through: loginType
                })
                .eq('id', existingUser.id)
                .select()
                .single();

            if (updateError) {
                console.warn("Error updating user:", updateError);
                return existingUser; // Return existing user even if update fails
            }

            return updatedUser || existingUser;
        } else {
            // Insert new user into the database
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert(userinfo)
                .select()
                .single();

            if(insertError){
                throw new Error(`Error in inserting user: ${insertError.message}`);
            } else {
                console.log("newUser", newUser);
                return newUser;
            }
        }

        // Fallback to REST API if needed (commented out)
        // const res = await APICaller(APIService.post(`/addUser`, {
        //     data: { ...userInfo, loginType }
        // }))
        // return res.data;

    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}


export const deletUser = async (userId: string) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }

        return { success: true, message: 'User deleted successfully' };

        // Fallback to REST API if needed (commented out)
        // const res = await APICaller(APIService.delete(`/user?id=${userId}`))
        // return res.data;
    } catch (error: any) {
        console.log("Fetching Error: ", error.message || error); // Log the error message
        throw new Error(error.message || error); // Re-throw with message for clarity
    }
}