import React, { Component } from "react";

const imageFormat: string = "image/jpeg";

export const ERROR_NOT_ALLOWED = "Error:NotAllowed";

export enum DOMCameraErrorTypes {
	streamError = 2,
	mediaDevicesAccessFail = 3,
	noVideoInputs = 4,
	enumerateDevicesFail = 5,
	notAllowed = 6,
	browserIncapable = 7,
	other = 8,
}

export enum DOMCameraStateEnum {
	isLoading = 2,
	isError = 3,
	isVideoing = 4,
}

export interface DOMCameraState {
	curStep: DOMCameraStateEnum;
	vidDeviceList: MediaDeviceInfo[] | null;
	curId: string | null;
}

export interface DOMCameraUserInteraction {
	onImageSrcReady?: (imgURL: string) => void;
	onVideoSrcReady?: (videoURL: string) => void;
	onVideoRecordingStarted?: () => void;
	onVideoRecordingStopped?: () => void;
	/**
	 * not yet implemented
	 */
	onVideoRecordingPaused?: () => void;
	onReadyToStream?: () => void;
}

export interface DOMCameraCallbacks {
	onVideoDisplayReady?: (video: HTMLVideoElement) => void;
	onVideoDisplayRemoved?: () => void;
	onError?: (errorType: DOMCameraErrorTypes) => void;
}

/**
 * inspired by:
 * https://webrtc.github.io/samples/
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/record/js/main.js
 */
export interface DOMCameraProps
	extends DOMCameraUserInteraction,
		DOMCameraCallbacks {
	/**
	 * flag to display renderControls() or not
	 */
	showControls: boolean;
	isRecordingAudio?: boolean;
	/**
	 * by default, the DOMCamera will stream directly. Set this to prohibit that
	 */
	isNoStream?: boolean;
}

/**
 * inspired by:
 * https://webrtc.github.io/samples/
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/record/js/main.js
 *
 * this class only concerns getting a video stream from the devices camera, or failing to do so.
 * It can also handle getting individual images, and will by default render the video stream
 * in a <video>-tag, so the users can see themselves.
 */
export class DOMCamera<TProps = DOMCameraProps> extends Component<
	TProps & DOMCameraProps,
	DOMCameraState
> {
	videoDispl: HTMLVideoElement | null;
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;

	private stream: MediaStream;
	private _isMounted: boolean = false;

	constructor(props: TProps & DOMCameraProps) {
		super(props);
		this.state = {
			curStep: DOMCameraStateEnum.isLoading,
			vidDeviceList: null,
			curId: null,
		} as DOMCameraState;
	}

	public getStream() {
		return this.stream;
	}

	startStream(strDeviceId: string) {
		if (!this.videoDispl) return;
		if (this.videoDispl.srcObject) return;
		const vidDispl = this.videoDispl;
		navigator.mediaDevices
			.getUserMedia({
				video: { deviceId: strDeviceId },
				audio: !!this.props.isRecordingAudio,
			})
			.then((stream) => {
				if (!this.videoDispl || !this.videoDispl!.paused) {
					stream.getTracks().forEach((track) => {
						track.stop();
					});
					return;
				}
				this.stream = stream;
				vidDispl.setAttribute('autoplay', 'true');
				vidDispl.setAttribute('muted', 'true');
				vidDispl.muted = true;
				vidDispl.setAttribute('playsinline', 'true');
				vidDispl.srcObject = stream;
				vidDispl.play();
				this.triggerReadyToRecord();
			})
			.catch((e: DOMException) => {
				if (e && e.name && e.name === ERROR_NOT_ALLOWED) {
					this.setStateToError(DOMCameraErrorTypes.notAllowed);
				} else {
					this.setStateToError(DOMCameraErrorTypes.streamError);
				}
				return;
			});
	}

	componentWillUnmount() {
		this._isMounted = false;
		if (this.state.curStep !== DOMCameraStateEnum.isError) {
			this.setStateIfMounted({
				curStep: DOMCameraStateEnum.isLoading,
				vidDeviceList: null,
				curId: null,
			});
		}
		if (this.stream && this.stream.active) {
			this.stream.getTracks().forEach((track) => {
				track.stop();
			});
		}
		if (this.videoDispl) this.videoDispl.pause();
		if (this.props.onVideoDisplayRemoved) {
			this.props.onVideoDisplayRemoved();
		}
		this.videoDispl = null;
	}

	setStateIfMounted(state: DOMCameraState, callback?: () => void) {
		if (!this._isMounted) return;
		this.setState(state as DOMCameraState, callback);
	}

	setStateToError(errorType: DOMCameraErrorTypes) {
		if (!this._isMounted) return;
		this.setStateIfMounted({
			...this.state,
			curStep: DOMCameraStateEnum.isError,
		});
		if (this.props.onVideoDisplayRemoved) {
			this.props.onVideoDisplayRemoved();
		}
		if (this.props.onError) {
			this.props.onError(errorType);
		}
	}
	componentDidMount() {
		this._isMounted = true;
		if (
			!navigator.mediaDevices ||
			!navigator.mediaDevices.enumerateDevices
		) {
			this.setStateToError(DOMCameraErrorTypes.mediaDevicesAccessFail);
			return;
		}
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const vidInputList: MediaDeviceInfo[] = [];
				devices.forEach((device) => {
					if (device.kind === 'videoinput') {
						vidInputList.push(device);
					}
				});
				if (vidInputList.length === 0) {
					this.setStateToError(DOMCameraErrorTypes.noVideoInputs);
					return;
				}
				{
					const deviceId = vidInputList[0].deviceId;
					this.setStateIfMounted(
						{
							curId: deviceId,
							curStep: DOMCameraStateEnum.isVideoing,
							vidDeviceList: vidInputList,
						},
						() => {
							if (!this.props.isNoStream) {
								this.startStream(deviceId);
							}
							this.triggerReadyToStream();
						}
					);
					return;
				}
			})
			.catch(() => {
				this.setStateToError(DOMCameraErrorTypes.enumerateDevicesFail);
				return;
			});
	}

	getScreenshotAsDataURL() {
		const canvas = this.getCanvas();
		if (canvas && this.props.onImageSrcReady) {
			const b = canvas.toDataURL(imageFormat);
			this.props.onImageSrcReady(b);
		}
	}

	getScreenshotAsBlob() {
		const canvas = this.getCanvas();
		if (canvas) {
			canvas.toBlob((a) => {
				if (this.props.onImageSrcReady) {
					const b = window.URL.createObjectURL(a);
					this.props.onImageSrcReady(b);
				}
			});
		}
	}

	getCanvas() {
		const vidDispl = this.videoDispl;
		if (!vidDispl) return null;
		if (!vidDispl.videoHeight) return null;

		if (!this.ctx) {
			const canvasElem = document.createElement('canvas');
			const aspectRatio = vidDispl.videoWidth / vidDispl.videoHeight;

			canvasElem.width = vidDispl.clientWidth;
			canvasElem.height = vidDispl.clientWidth / aspectRatio;

			this.canvas = canvasElem;
			this.ctx = canvasElem.getContext('2d')!;
		}

		this.checkAndDrawOnCanvas();

		return this.canvas;
	}

	checkAndDrawOnCanvas() {
		if (this.ctx && this.videoDispl && this.canvas) {
			this.ctx.drawImage(
				this.videoDispl,
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);
		}
	}

	triggerReadyToStream() {
		if (this._isMounted && this.props.onReadyToStream) {
			this.props.onReadyToStream();
		}
	}

	triggerReadyToRecord() {
		if (this._isMounted && this.props.onVideoDisplayReady) {
			this.props.onVideoDisplayReady(this.videoDispl!);
		}
	}

	startVideoRecording() {
		if (this.props.onVideoRecordingStarted)
			this.props.onVideoRecordingStarted();
	}

	stopVideoRecording() {
		if (this.props.onVideoRecordingStopped)
			this.props.onVideoRecordingStopped();
	}

	/**
	 * not yet implemented
	 */
	pauseVideoRecording() {
		if (this.props.onVideoRecordingPaused)
			this.props.onVideoRecordingPaused();
	}

	renderError() {
		return <span>error opening camera</span>;
	}

	renderLoading() {
		return <span>loading</span>;
	}

	renderVideo() {
		const { curId } = this.state as DOMCameraState;
		return (
			<video
				ref={(video) => {
					if (!video) return;
					this.videoDispl = video;
					if (curId && !this.props.isNoStream) this.startStream(curId);
				}}
			/>
		);
	}

	renderControls() {
		return (
			<div className="controls-container">
				{/* icon='camera' floating accent  */}
				<button
					onClick={() => {
						if (this.props.onImageSrcReady)
							this.getScreenshotAsBlob();
					}}
				/>
			</div>
		);
	}

	render() {
		const { curStep } = this.state;
		return (
			<div className="dom-camera">
				{(() => {
					switch (curStep) {
						case DOMCameraStateEnum.isError:
							return this.renderError();
						case DOMCameraStateEnum.isLoading:
							return this.renderLoading();
						case DOMCameraStateEnum.isVideoing:
							return (
								<>
									{this.renderVideo()}
									{this.renderControls()}
								</>
							);
						default:
							return null;
					}
				})()}
			</div>
		);
	}
}
