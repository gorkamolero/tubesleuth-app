import axios from "axios";
import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { animationParameters } from "../../lib/animations";

const v = 8;

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || "us-east-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

/**
 * Reading configuration from environment
 */

const CLIENT_ID = process.env.LEIA_ID;
const CLIENT_SECRET = process.env.LEIA_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error(
		"Error. In order to authenticate against Leia Media Cloud" +
			" API, you need to provide BACKEND_CLIENT_ID and BACKEND_CLIENT_SECRET " +
			"env vars",
	);
	process.exit(1);
}

const fx = animationParameters.zoom;

/**
 * Needs to be configured before running a script;
 */
const MEDIA_CLOUD_REST_API_BASE_URL = "https://api.leiapix.com";
const LEIA_LOGIN_OPENID_TOKEN_URL =
	"https://auth.leialoft.com/auth/realms/leialoft/protocol/openid-connect/token";

const ORIGINAL_IMAGE_URL =
	process.env.ORIGINAL_IMAGE_URL && process.env.ORIGINAL_IMAGE_URL !== ""
		? process.env.ORIGINAL_IMAGE_URL
		: "https://images.pexels.com/photos/38771/pexels-photo-38771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

const TWENTY_FOUR_HRS_IN_S = 24 * 60 * 60;
const THREE_MIN_IN_MS = 3 * 60 * 1000;

const awsClient = new S3Client({
	region: S3_BUCKET_REGION,
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
});

const typeOfAnimation = "mp4";

const S3_DISPARITY_MAP_PATH = `public/leiapixcloud/disparity-${v}.jpg`;
const S3_Anim_PATH = `public/leiapixcloud/animation-${v}.${typeOfAnimation}`;

export const fullLeiaPix = async ({
	disparityURL = undefined,
}: {
	disparityURL?: string | undefined;
}) => {
	try {
		/**
		 * First, we need to authenticate against Leia Login with Client
		 * credentials and acquire a temporary access token.
		 *
		 * You can generate ClientID and Client Secret in Leia Login API Section.
		 */

		console.log("Acquiring access token from LeiaLogin...");

		const tokenResponse = await axios.post(
			LEIA_LOGIN_OPENID_TOKEN_URL,
			{
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				grant_type: "client_credentials",
			},
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				timeout: THREE_MIN_IN_MS,
			},
		);

		const accessToken = tokenResponse.data.access_token;

		console.log(`\nLeiaLogin AccessToken acquired: ${accessToken}`);

		/**
		 * Now that we have an oidc access token we can call the API. First, let's
		 * generate a disparity map for our image.
		 */

		// We start with preparing a correlationId. This might be an internal
		// ID which you use in your system for this image/entity represented
		// by the image/etc, or, as we do now, we can just generate new UUID.
		let correlationId = uuid();
		let disparityFinalURL = ";";

		if (!disparityURL) {
			// You probably want to store the image somewhere. You need to provide
			// an uploadable URL where Leia Media Cloud API will PUT the result of a
			// call. Here we use AWS S3 pre-signed URLs as uploadable url. The url
			// needs to support HTTP PUT command.
			const putDisparityCommand = new PutObjectCommand({
				Bucket: S3_BUCKET_NAME,
				Key: S3_DISPARITY_MAP_PATH,
			});
			const putDisparityPresignedUrl = await getSignedUrl(
				awsClient,
				putDisparityCommand,
				{ expiresIn: TWENTY_FOUR_HRS_IN_S },
			);

			console.log(`\nGenerating Disparity: ${correlationId}...`);

			// Now we're ready to call the API. We provide only required parameters: a
			// correlationId, URL of the image for which we want to generate
			// disparity map, and the result url where disparity map will be
			// uploaded. You can find all available parameters in the documentation
			// on https://cloud.leiapix.com
			await axios.post(
				`${MEDIA_CLOUD_REST_API_BASE_URL}/api/v1/disparity`,
				{
					correlationId,
					inputImageUrl: ORIGINAL_IMAGE_URL,
					resultPresignedUrl: putDisparityPresignedUrl,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					timeout: THREE_MIN_IN_MS,
				},
			);

			// At this point, the disparity map should be uploaded to the upload
			// url. We omit the error handling in this example for simplicity, but
			// you should always check for a returned status & errors from the API
			// in real code.

			// To demonstrate that the upload was successful, we generate a GET
			// presigned URL to output it to be used. This URL will also be used
			// later in the script as an input for an animation call - but it is
			// optional if the disparity map is the only result you need.

			const getDisparityCommand = new GetObjectCommand({
				Bucket: S3_BUCKET_NAME,
				Key: S3_DISPARITY_MAP_PATH,
			});
			const getDisparityPresignedUrl = await getSignedUrl(
				awsClient,
				getDisparityCommand,
				{ expiresIn: TWENTY_FOUR_HRS_IN_S },
			);

			console.log(
				"\nDisparity has been uploaded to specified AWS S3 bucket." +
					`To view it, use this GET URL: ${getDisparityPresignedUrl}`,
			);

			disparityFinalURL = getDisparityPresignedUrl;
		} else {
			disparityFinalURL = disparityURL;
		}

		// If you're interested not only in a disparity map, but you also want
		// to generate an animation, you would need to make another request to
		// the service. The steps are very similar to how we called a disparity
		// map endpoint: first we acquire correlationId...
		correlationId = uuid();

		// ...then we prepare an uploadable url...
		const putAnimCommand = new PutObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: S3_Anim_PATH,
		});
		const putAnimPresignedUrl = await getSignedUrl(
			awsClient,
			putAnimCommand,
			{ expiresIn: TWENTY_FOUR_HRS_IN_S },
		);

		console.log(`\nGenerating animation: ${correlationId}...`);

		// ...and we make a request. This time we need four required inputs: a
		// correlationId; original image we want to animate (which was used for
		// disparity map generation); the downloadable URL for a disparity map
		// from previous step (this URL needs to support HTTP GET verb); and an
		// uploadable url for the result animation. You can find all available
		// parameters in the documentation on https://cloud.leiapix.com
		await axios.post(
			`${MEDIA_CLOUD_REST_API_BASE_URL}/api/v1/animation`,
			{
				correlationId,
				inputImageUrl: ORIGINAL_IMAGE_URL,
				inputDisparityUrl: disparityFinalURL,
				animationType: typeOfAnimation,
				resultPresignedUrl: putAnimPresignedUrl,
				animationLength: 6,
				// @ts-ignore
				gain: 0.2,
				number: 10,
				...fx,
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				timeout: THREE_MIN_IN_MS,
			},
		);

		// This step is optional. We generate a presigned url to download the
		// results of the animation call for convenience.
		const getAnimCommand = new GetObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: S3_Anim_PATH,
		});
		const getAnimPresignedUrl = await getSignedUrl(
			awsClient,
			getAnimCommand,
			{ expiresIn: TWENTY_FOUR_HRS_IN_S },
		);

		console.log(
			"\nAnim Animation has been uploaded to specified AWS S3 bucket." +
				`To download, please use this GET URL:: ${getAnimPresignedUrl}`,
		);

		return {
			getDisparityPresignedUrl: disparityFinalURL,
			getAnimPresignedUrl,
		};
	} catch (e: any) {
		if (e.hasOwnProperty("message") || e.hasOwnProperty("response")) {
			console.error(
				`Error. Unhandled exception: ${JSON.stringify(e.message)}`,
			);
			console.error(`Error body: ${JSON.stringify(e.response?.data)}`);
		} else {
			console.error(`Error. Unhandled exception: ${JSON.stringify(e)}`);
		}
	}
};
