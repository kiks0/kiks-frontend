import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CartSync = () => {
    const { items = [] } = useSelector(state => state.cart || {});
    const dispatch = useDispatch();

    const { token, user, isAuthenticated } = useSelector(state => state.auth || {});

    const lastSyncRef = useRef(null);
    const fetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);
    const itemsRef = useRef(items);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    // 1. Fetch cart from database after login
    useEffect(() => {
        const fetchCart = async () => {
            const userId = user?.id || user?._id || user?.user_id;

            if (!isAuthenticated || !token || !userId) {
                console.log('[VAULT] Auth or ID missing, skipping fetch. ID detected:', userId);
                hasFetchedRef.current = false;
                lastSyncRef.current = null;
                return;
            }

            fetchingRef.current = true;
            console.log('[VAULT] Opening Vault for Patron ID:', userId);

            try {
                const res = await fetch(`${API_URL}/api/carts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    console.error('[VAULT] Entry Denied:', res.status);
                    return;
                }

                const data = await res.json();
                let dbItems = data.items || [];
                console.log('[VAULT] Items found in Vault:', dbItems);

                // Handle cases where DB returns {} instead of []
                if (dbItems && !Array.isArray(dbItems) && typeof dbItems === 'object') {
                    console.warn('[VAULT] Normalizing object to array...');
                    dbItems = [];
                }

                if (typeof dbItems === 'string') {
                    try {
                        dbItems = JSON.parse(dbItems);
                    } catch {
                        dbItems = [];
                    }
                }

                const mappedDbItems = Array.isArray(dbItems)
                    ? dbItems.map(item => ({
                        id: String(item.product_id || item.id),
                        name: item.product_name || item.name,
                        quantity: Number(item.quantity || 1),
                        price: item.price,
                        image_url: item.image_url || item.product_image,
                        size: item.size || '100ml',
                    }))
                    : [];

                console.log('[VAULT] Sanctified items for Redux:', mappedDbItems);

                const currentLocalItems = itemsRef.current || [];
                let mergedItems = [...mappedDbItems];

                currentLocalItems.forEach(localItem => {
                    const dbItemIdx = mergedItems.findIndex(dbItem =>
                        String(dbItem.id) === String(localItem.id) && String(dbItem.size) === String(localItem.size)
                    );

                    if (dbItemIdx > -1) {
                        // Item exists in both: update quantity to the sum
                        mergedItems[dbItemIdx] = {
                            ...mergedItems[dbItemIdx],
                            quantity: Number(mergedItems[dbItemIdx].quantity || 0) + Number(localItem.quantity || 0)
                        };
                    } else {
                        // Item only in guest cart: add it
                        mergedItems.push(localItem);
                    }
                });

                lastSyncRef.current = JSON.stringify(mergedItems);
                dispatch(setCart({ items: mergedItems }));
            } catch (err) {
                console.error('Cart retrieval fault:', err);
            } finally {
                fetchingRef.current = false;
                hasFetchedRef.current = true;
            }
        };

        fetchCart();
    }, [isAuthenticated, token, user?.id, dispatch]);

    // 2. Sync cart to database after cart changes
    useEffect(() => {
        const syncCart = async () => {
            const userId = user?.id || user?._id || user?.user_id;
            if (!isAuthenticated || !token || !userId) return;
            if (fetchingRef.current || !hasFetchedRef.current) return;

            // Do not sync while fetching DB cart
            if (fetchingRef.current) return;

            // Do not sync before first fetch is completed
            if (!hasFetchedRef.current) return;

            // Avoid first empty cart overwrite
            if (items.length === 0 && !lastSyncRef.current) return;

            const cartState = JSON.stringify(items);

            // No change, no sync
            if (cartState === lastSyncRef.current) return;

            try {
                console.log(`[CART] Syncing ${items.length} items to database...`);

                const res = await fetch(`${API_URL}/api/carts/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user?.id || user?._id || user?.user_id,
                        email: user?.email,
                        items: items.map(i => ({
                            product_id: i.id,
                            product_name: i.name,
                            quantity: i.quantity || 1,
                            price: i.price,
                            image_url: i.image_url || i.image || i.banner_url,
                            size: i.size || '100ml',
                        })),
                    }),
                });

                if (!res.ok) {
                    const errRes = await res.json();
                    console.error('[VAULT] Sync Failure:', res.status, errRes.msg);
                    return;
                }

                lastSyncRef.current = cartState;
                console.log('[VAULT] Vault updated successfully.');
            } catch (err) {
                console.error('Cart sync fault:', err);
            }
        };

        const timeout = setTimeout(syncCart, 1000);

        return () => clearTimeout(timeout);
    }, [items, isAuthenticated, token, user?.id]);

    return null;
};

export default CartSync;
