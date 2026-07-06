import * as shopify from './shopify.js';
import * as woocommerce from './woocommerce.js';
import * as amazon from './amazon.js';
import * as ebay from './ebay.js';
import * as faire from './faire.js';

// Every channel connector, in dashboard order.
export const connectors = [woocommerce, shopify, faire, amazon, ebay];
