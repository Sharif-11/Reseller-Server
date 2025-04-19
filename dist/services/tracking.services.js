"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERFLY_URL = exports.REDX_URL = exports.PATHAO_URL = exports.STEADFAST_URL = void 0;
exports.STEADFAST_URL = 'https://www.steadfast.com.bd/track/consignment/';
exports.PATHAO_URL = 'https://merchant.pathao.com/api/v1/user/tracking/';
exports.REDX_URL = 'https://api.redx.com.bd/v1/logistics/global-tracking/';
exports.PAPERFLY_URL = 'https://go-app.paperfly.com.bd/merchant/api/react/order/track_order.php?order_number=';
class CourierTracker {
    static extractTrackingNumber(url, courier) {
        switch (courier) {
            case 'Steadfast':
                return url.replace(exports.STEADFAST_URL, '').split('/')[0];
            case 'Pathao':
                return url.replace(exports.PATHAO_URL, '').split('/')[0];
            case 'Redx':
                return url.replace(exports.REDX_URL, '').split('/')[0];
            case 'Paperfly':
                return new URL(url).searchParams.get('order_number') || '';
            default:
                return url.split('/').pop() || '';
        }
    }
    static getTrackingUrl(courier, trackingNumber) {
        switch (courier) {
            case 'Steadfast':
                return `${exports.STEADFAST_URL}${trackingNumber}`;
            case 'Pathao':
                return `${exports.PATHAO_URL}${trackingNumber}`;
            case 'Redx':
                return `${exports.REDX_URL}${trackingNumber}`;
            case 'Paperfly':
                return `${exports.PAPERFLY_URL}${trackingNumber}`;
            case 'Sundarban':
                return `https://www.sundarbancourier.com/track/${trackingNumber}`;
            default:
                return '';
        }
    }
    static getCourierFromUrl(url) {
        if (url.includes(exports.STEADFAST_URL))
            return 'Steadfast';
        if (url.includes(exports.PATHAO_URL))
            return 'Pathao';
        if (url.includes(exports.REDX_URL))
            return 'Redx';
        if (url.includes(exports.PAPERFLY_URL))
            return 'Paperfly';
        if (url.includes('sundarbancourier.com'))
            return 'Sundarban';
        return 'Unknown';
    }
    static parseTrackingInfo(url) {
        const courier = this.getCourierFromUrl(url);
        const trackingNumber = this.extractTrackingNumber(url, courier);
        return { courier, trackingNumber };
    }
    // Standardize Paperfly response
    static standardizePaperfly(response) {
        const steps = response.timeline.map((item, index) => {
            const dateTime = new Date(item.date_time);
            return {
                id: index + 1,
                status: index === 0 ? 'active' : 'completed', // Most recent is active
                title: item.message.split(',')[0], // Take first part of message as title
                description: item.message,
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        }).reverse(); // Reverse to show most recent first
        return {
            success: true,
            courier: 'Paperfly',
            trackingNumber: response.order_number,
            status: response.status,
            steps,
        };
    }
    // Standardize Pathao response
    static standardizePathao(response) {
        const steps = response.data.log.map((item, index) => {
            const dateTime = new Date(item.created_at);
            return {
                id: index + 1,
                status: index === 0 ? 'active' : 'completed',
                title: item.desc.split('.')[0], // Take first sentence as title
                description: item.desc,
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        }).reverse();
        return {
            success: true,
            courier: 'Pathao',
            trackingNumber: response.data.order.consignment,
            status: response.data.state.name,
            estimatedDelivery: response.data.order.estimated_date,
            steps,
        };
    }
    // Standardize Redx response (prioritizing Bangla messages)
    static standardizeRedx(response) {
        var _a;
        const steps = response.tracking.map((item, index) => {
            const dateTime = new Date(item.time);
            const description = item.messageBn || item.messageEn;
            return {
                id: index + 1,
                status: this.getRedxStatus(item.status),
                title: description.split('.')[0].split(':')[0], // Clean up title
                description,
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        }).reverse();
        return {
            success: true,
            courier: 'Redx',
            trackingNumber: '', // Redx response doesn't include tracking number in this format
            status: ((_a = response.tracking[0]) === null || _a === void 0 ? void 0 : _a.status) || 'Unknown',
            steps,
        };
    }
    // Standardize Steadfast response
    static standardizeSteadfast(response) {
        const timeline = response[1]; // Timeline is the second element in array
        const steps = timeline.map((item, index) => {
            const dateTime = new Date(item.created_at);
            return {
                id: index + 1,
                status: index === 0 ? 'active' : 'completed',
                title: item.text.split('.')[0], // Take first sentence as title
                description: item.text,
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
        }).reverse();
        return {
            success: true,
            courier: 'Steadfast',
            trackingNumber: response[0].track_id,
            status: response[0].status === 2 ? 'Delivered' : 'In Transit',
            steps,
        };
    }
    // Helper to determine Redx status
    static getRedxStatus(status) {
        if (status.includes('delivered'))
            return 'completed';
        if (status.includes('progress') || status.includes('started'))
            return 'active';
        return 'pending';
    }
    // Main method to standardize any courier response
    static standardizeResponse(courier, response) {
        try {
            switch (courier.toLowerCase()) {
                case 'paperfly':
                    return this.standardizePaperfly(response);
                case 'pathao':
                    return this.standardizePathao(response);
                case 'redx':
                    return this.standardizeRedx(response);
                case 'steadfast':
                    return this.standardizeSteadfast(response);
                default:
                    return this.createErrorResponse(courier, 'Unsupported courier');
            }
        }
        catch (error) {
            return this.createErrorResponse(courier, 'Failed to parse response');
        }
    }
    static createErrorResponse(courier, error) {
        return {
            success: false,
            courier,
            trackingNumber: '',
            status: 'Error',
            steps: [],
            error,
        };
    }
}
exports.default = CourierTracker;
