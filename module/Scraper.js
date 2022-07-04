const axios = require("axios");

class Scraper {
	constructor(session) {
		this.session = session;
	}

	static #getCsrfToken = async () => {
		try {
			const { headers } = await axios({
				method: 'GET',
				url: 'https://www.instagram.com/accounts/login/'
			});
			let csrfToken = headers["set-cookie"]?.find(x => x.match(/csrftoken=(.*?);/)?.[1])?.match(/csrftoken=(.*?);/)?.[1] || '';
			return csrfToken
		} catch (error) {
			throw error
		}
	}
	/**
	 * @param {username} username Your Instagram Username
	 * @param {password} password Your Instagram Password
	 * @returns {cookies} Your Cookies
	 */
	static getCookies = async (username, password) => {
		try {
			const csrfToken = await this.#getCsrfToken();
			const genHeaders = {
				'X-CSRFToken': csrfToken,
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
				'cache-Control': 'no-cache',
				'content-type': 'application/x-www-form-urlencoded',
				'referer': 'https://www.instagram.com/accounts/login/?source=auth_switcher',
				'authority': 'www.instagram.com',
				'origin': 'https://www.instagram.com',
				'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
				'sec-fetch-site': 'same-origin',
				'sec-fetch-mode': 'cors',
				'sec-fetch-dest': 'empty',
				'x-ig-app-id': '936619743392459',
				'x-ig-www-claim': 'hmac.AR3W0DThY2Mu5Fag4sW5u3RhaR3qhFD_5wvYbOJOD9qaPjIf',
				'x-instagram-ajax': '1',
				'x-requested-with': 'XMLHttpRequest',
				'Cookie': 'csrftoken=' + csrfToken + ';'
			}

			const { headers, data } = await axios({
				method: 'POST',
				url: 'https://www.instagram.com/accounts/login/ajax/',
				data: `username=${username}&enc_password=#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${encodeURIComponent(password)}&queryParams=%7B%22source%22%3A%22auth_switcher%22%7D&optIntoOneTap=false`,
				headers: genHeaders
			});

			const { userId, authenticated } = (data);
			if (authenticated) {
				let cookies = headers['set-cookie']?.map(x => x.match(/(.*?=.*?);/)?.[1])?.join('; ') || '';
				return cookies;
			} else {
				throw new Error('Username/Password Incorrect');
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.toJSON()
			} else {
				throw error
			}
		}
	}

	#buildHeaders = (agent) => {
		return {
			'user-agent': agent,
			'cookie': `${this.session}`,
			'authority': 'www.instagram.com',
			'content-type': 'application/x-www-form-urlencoded',
			'origin': 'https://www.instagram.com',
			'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
			'sec-fetch-site': 'same-origin',
			'sec-fetch-mode': 'cors',
			'sec-fetch-dest': 'empty',
			'x-ig-app-id': 936619743392459,
			'x-ig-www-claim': 'hmac.AR3W0DThY2Mu5Fag4sW5u3RhaR3qhFD_5wvYbOJOD9qaPjIf',
			'x-instagram-ajax': 1,
			'x-requested-with': 'XMLHttpRequest'
		};
	}

	#fetchApi = (baseURL, url, agent, options) => {
		try {
			return axios({
				baseURL,
				url,
				headers: this.#buildHeaders(agent),
				method: options.method || 'GET',
				...options
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response
			}
		}
	}
	/**
	 * Returns ID Of Specified Username
	 * @param {username} username Target Username
	 * @returns Target's ID
	 */
	getIdByUsername = async (username) => {
		const res = await this.#fetchApi(`https://www.instagram.com/`, `${username}/?__a=1&__d=dis`, 'Instagram 123.0.0.21.114 (iPhone; CPU iPhone OS 11_4 like Mac OS X; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/605.1.15', {});
		return res?.data.graphql.user.id || res
	}
	/**
	 * Returns Profile Info Of Target Username
	 * @param {username} username Target Username
	 * @returns Target's Profile Info
	 */
	fetchUser = async (username) => {
		const uid = await this.getIdByUsername(username);
		const res = await this.#fetchApi('https://i.instagram.com/api/v1/users', `/${uid}/info/`, 'Instagram 10.8.0 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)', {});
		const graphql = res?.data;
		if (!this.session) throw new Error('No Cookies Found!');
		if (!typeof graphql.user.full_name) throw new Error('Update Cookie Please!');
		return {
			id: graphql.user.pk,
			username: graphql.user.username,
			fullname: graphql.user.full_name,
			followers: graphql.user.follower_count,
			following: graphql.user.following_count,
			post_count: graphql.user.media_count,
			is_private: graphql.user.is_private,
			is_verified: graphql.user.is_verified,
			biography: graphql.user.biography,
			external_url: graphql.user.external_url,
			total_igtv_videos: graphql.user.total_igtv_videos,
			has_videos: graphql.user.has_videos,
			hd_profile_pic_url_info: graphql.user.hd_profile_pic_url_info,
			has_highlight_reels: graphql.user.has_highlight_reels,
			has_guides: graphql.user.has_guides,
			is_business: graphql.user.is_business,
			contact_phone_number: graphql.user.contact_phone_number,
			public_email: graphql.user.public_email,
			account_type: graphql.user.account_type,
		};
	}
	/**
	 * Returns Profile Info Of Target Username In GraphQL Format
	 * @param {username} username Target Username
	 * @returns Target's Profile Info
	 */
	fetchUserQL = async (username) => {
		const res = await this.#fetchApi('https://www.instagram.com', `/${username}/?__a=1&__d=dis`, 'Instagram 10.8.0 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)', {});
		const { graphql } = res?.data;
		return graphql.user;
	}
	/**
	 * Returns Profile Picture Info Of Target Username
	 * @param {username} username Target Username
	 * @returns Target's Profile Picture Info
	 */
	getPicture = async (username) => {
		const uid = await this.getIdByUsername(username);
		const res = await this.#fetchApi('https://i.instagram.com/api/v1/users', `/${uid}/info/`, 'Instagram 10.8.0 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)', {});
		const graphql = res?.data;
		if (!this.session) throw new Error('No Cookies Found!');
		if (!typeof graphql.user.full_name) throw new Error('Update Cookie Please!');
		return graphql.user.hd_profile_pic_url_info;
	}
}

module.exports = Scraper;
