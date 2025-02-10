<!-- <template>
	<scroll-view>
		<view>
			<uni-nav-bar background-color="#4ab3df" left-icon="link" right-icon="person" :title="deviceName" @clickLeft="navigateToAddDevice" @clickRight="navigateToUser"></uni-nav-bar>
			<TotalHeatmap class="total-heatmap-container"></TotalHeatmap>
			<view class="status" @click="handleStatusClick">
				<text :class="{ connected: isConnected }">{{ connectionStatus }}</text>
			</view>
			<uni-card>
				<uni-list>
					<uni-list-item thumb="../../static/icons8-seat.png" title="座椅调节" link to="/pages/AdjustSeat/AdjustSeat"></uni-list-item>
					<uni-list-item thumb="../../static/icons8-voice.png" title="语音交互" link to="/pages/VoiceInteraction/VoiceInteraction"></uni-list-item>
					<uni-list-item thumb="../../static/icons8-statistics.png" title="数据统计" link to="/pages/DataStatistics/DataStatistics"></uni-list-item>
				</uni-list>
			</uni-card>
		</view>
	</scroll-view>
</template>

<script>
import TotalHeatmap from '../../components/TotalHeatmap.vue';
import { mapState } from 'vuex';

export default {
	components: {
		TotalHeatmap
	},
	computed: {
		...mapState(['isConnected', 'connectionStatus']),
		deviceName() {
			return 'BUPT智能座椅';
		},
	},
	methods: {
		handleStatusClick() {
			if (!this.isConnected) {
				this.navigateToAddDevice();
			}
		},
		navigateToAddDevice() {
			uni.navigateTo({
				url: '/pages/AddDevice/AddDevice'
			});
		},
		navigateToUser() {
			uni.navigateTo({
				url: '/pages/User/User'
			});
		},
	},
}
</script>

<style>
	.total-heatmap-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 20px;
	}
	.status {
		text-align: center;
		margin: 10px 0;
		cursor: pointer; /* 添加手型光标指示 */
	}
	.connected {
		color: green;
	}
</style> -->

<template>
  <scroll-view>
    <view>
      <uni-nav-bar
        background-color="#4ab3df"
        left-icon="link"
        right-icon="person"
        :title="deviceName"
        @clickLeft="navigateToAddDevice"
        @clickRight="navigateToUser"
      ></uni-nav-bar>
      
      <!-- 替换 TotalHeatmap -->
      <ModelViewer class="model-viewer-container"></ModelViewer>

      <view class="status" @click="handleStatusClick">
        <text :class="{ connected: isConnected }">{{ connectionStatus }}</text>
      </view>

      <uni-card>
        <uni-list>
          <uni-list-item
            thumb="../../static/icons8-seat.png"
            title="座椅调节"
            link
            to="/pages/AdjustSeat/AdjustSeat"
          ></uni-list-item>
          <uni-list-item
            thumb="../../static/icons8-voice.png"
            title="语音交互"
            link
            to="/pages/VoiceInteraction/VoiceInteraction"
          ></uni-list-item>
          <uni-list-item
            thumb="../../static/icons8-statistics.png"
            title="数据统计"
            link
            to="/pages/DataStatistics/DataStatistics"
          ></uni-list-item>
        </uni-list>
      </uni-card>
    </view>
  </scroll-view>
</template>

<script>
import ModelViewer from "../../components/ModelViewer.vue";
import { mapState } from "vuex";

export default {
  components: {
    ModelViewer,
  },
  computed: {
    ...mapState(["isConnected", "connectionStatus"]),
    deviceName() {
      return "BUPT智能座椅";
    },
  },
  methods: {
    handleStatusClick() {
      if (!this.isConnected) {
        this.navigateToAddDevice();
      }
    },
    navigateToAddDevice() {
      uni.navigateTo({
        url: "/pages/AddDevice/AddDevice",
      });
    },
    navigateToUser() {
      uni.navigateTo({
        url: "/pages/User/User",
      });
    },
  },
};
</script>

<style>
.status {
  text-align: center;
  margin: 10px 0;
  cursor: pointer;
}
.connected {
  color: green;
}
</style>




