/**
 * /api/dsa-demo
 *
 * One admin-only endpoint that proves every beginner DSA topic
 * actually runs against the live database. Helpful for interviews —
 * you can open it during a screen-share and walk through each section.
 *
 * Topics demonstrated:
 *   1. Arrays
 *   2. Strings
 *   3. HashMap basics  (plain object)
 *   4. Stack           (LIFO)
 *   5. Queue           (FIFO)
 *   6. Linked List
 *   7. Sorting basics  (bubble sort)
 *   8. Searching       (linear + binary)
 *   9. Simple recursion
 */
const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const Stack = require('../dsa/Stack');
const Queue = require('../dsa/Queue');
const { LinkedList } = require('../dsa/LinkedList');
const { bubbleSort } = require('../dsa/sorting');
const { linearSearch, binarySearch } = require('../dsa/searching');
const { factorial, recursiveSum, recursiveCount } = require('../dsa/recursion');

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/', (req, res) => {
  const phoneQuery = (req.query.phone || '').toString();
  const database = db.getDb();

  database.all('SELECT * FROM services ORDER BY id ASC', (e1, services = []) => {
    if (e1) return res.status(500).json({ message: e1.message });

    database.all('SELECT * FROM customers ORDER BY id ASC', (e2, customers = []) => {
      if (e2) return res.status(500).json({ message: e2.message });

      database.all('SELECT * FROM technicians ORDER BY id ASC', (e3, technicians = []) => {
        if (e3) return res.status(500).json({ message: e3.message });

        database.all(
          'SELECT id, event_type, message, created_at FROM activity_logs ORDER BY id ASC LIMIT 10',
          (e4, logs = []) => {
            if (e4) return res.status(500).json({ message: e4.message });

            // 1. ARRAYS — services is an array of rows.
            //    .map / .filter / .length are array operations.
            const arraysDemo = {
              totalServices: services.length,
              serviceTypes: services.map(s => s.service_type)
            };

            // 2. STRINGS — toUpperCase, replace, includes.
            const firstName = (customers[0] && customers[0].name) || '';
            const stringsDemo = {
              firstCustomerNameUpper: firstName.toUpperCase(),
              firstCustomerPhoneDigitsOnly:
                ((customers[0] && customers[0].phone) || '').replace(/\D/g, ''),
              namesContainingA: customers
                .filter(c => (c.name || '').toLowerCase().includes('a'))
                .slice(0, 5)
                .map(c => c.name)
            };

            // 3. HASHMAP BASICS — count services per status using a plain object.
            const statusCounts = {};
            for (const s of services) {
              const k = s.status || 'unknown';
              statusCounts[k] = (statusCounts[k] || 0) + 1;
            }

            // 4. STACK — push activity logs, pop to read newest-first.
            const stack = new Stack();
            logs.forEach(l => stack.push(l));
            const recentLogsNewestFirst = [];
            while (!stack.isEmpty()) {
              const top = stack.pop();
              recentLogsNewestFirst.push({
                id: top.id, event: top.event_type, message: top.message
              });
            }

            // 5. QUEUE — first-come, first-served list of pending services.
            const queue = new Queue();
            services
              .filter(s => s.status === 'pending')
              .forEach(s => queue.enqueue(s));
            const fcfsPending = [];
            while (!queue.isEmpty()) {
              const head = queue.dequeue();
              fcfsPending.push({ id: head.id, type: head.service_type });
            }

            // 6. LINKED LIST — chain the first customer's services in order.
            const firstCustomer = customers[0];
            const chain = new LinkedList();
            if (firstCustomer) {
              services
                .filter(s => s.customer_id === firstCustomer.id)
                .forEach(s => chain.append({
                  id: s.id, type: s.service_type, status: s.status
                }));
            }
            const linkedListDemo = {
              customer: firstCustomer ? firstCustomer.name : null,
              chain: chain.toArray(),
              length: chain.length
            };

            // 7. SORTING — bubble sort technicians by current workload.
            const techLoad = technicians.map(t => ({
              id: t.id,
              name: t.name,
              active: services.filter(s =>
                s.technician_id === t.id &&
                ['pending', 'assigned', 'in_progress'].includes(s.status)
              ).length
            }));
            const sortedByLoad = bubbleSort(techLoad, x => x.active);

            // 8. SEARCHING — linear (any field) and binary (sorted by id).
            const linearMatch = phoneQuery
              ? linearSearch(customers, c => (c.phone || '').includes(phoneQuery))
              : { index: -1, item: null };

            const middleId = services.length
              ? services[Math.floor(services.length / 2)].id
              : -1;
            const binaryMatch = binarySearch(services, middleId, s => s.id);

            // 9. RECURSION — factorial, sum, predicate-count.
            const recursionDemo = {
              factorial5: factorial(5),
              sumOfServiceIds: recursiveSum(services.map(s => s.id)),
              completedCount: recursiveCount(services, s => s.status === 'completed')
            };

            res.json({
              note: 'Each section maps to one beginner DSA topic.',
              arrays: arraysDemo,
              strings: stringsDemo,
              hashmap: { statusCounts },
              stack: { recentLogsNewestFirst },
              queue: { fcfsPending },
              linkedList: linkedListDemo,
              sorting: { sortedByLoad },
              searching: {
                linearSearchPhoneQuery: phoneQuery || null,
                linearMatch: linearMatch.item
                  ? { id: linearMatch.item.id, name: linearMatch.item.name }
                  : null,
                binarySearchTargetId: middleId,
                binaryMatch: binaryMatch.item
                  ? { id: binaryMatch.item.id, type: binaryMatch.item.service_type }
                  : null
              },
              recursion: recursionDemo
            });
          }
        );
      });
    });
  });
});

module.exports = router;
