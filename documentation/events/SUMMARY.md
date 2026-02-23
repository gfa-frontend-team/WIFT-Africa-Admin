# Events Module - Quick Reference

## Overview
Complete event management system with approval workflows, RSVP tracking, and role-based access control.

## Key Features
- ✅ Event creation and management
- ✅ Approval workflow (Chapter Admin → Super Admin)
- ✅ RSVP system with capacity tracking
- ✅ Email and in-app notifications
- ✅ Attendee export (CSV/PDF)
- ✅ Chapter-specific and global events
- ✅ Physical, virtual, and hybrid event support

## Quick Stats
- **Models**: 2 (Event, EventRSVP)
- **Endpoints**: 11 total
  - 2 public
  - 2 authenticated user
  - 7 admin
- **Event Types**: 6 (Workshop, Screening, Networking, Meetup, Conference, Other)
- **Event Statuses**: 5 (Draft, Waiting, Published, Cancelled, Completed)
- **RSVP Statuses**: 2 (Going, Interested)
- **Email Templates**: 5
- **Notification Types**: 5

## API Endpoints Summary

### Public
- `GET /events` - List events
- `GET /events/:id` - Get event details

### Authenticated
- `POST /events/:id/rsvp` - RSVP to event
- `DELETE /events/:id/rsvp` - Cancel RSVP

### Admin
- `POST /admin/events` - Create event
- `PATCH /admin/events/:id` - Update event
- `DELETE /admin/events/:id` - Cancel event
- `GET /admin/events/:id/attendees` - Get attendees
- `PATCH /admin/events/:id/submit` - Submit for approval
- `PATCH /admin/events/:id/approve` - Approve event (Super Admin)
- `PATCH /admin/events/:id/reject` - Reject event (Super Admin)

## Event Lifecycle

```
DRAFT → WAITING → PUBLISHED → CANCELLED/COMPLETED
  ↑        ↓
  └────────┘ (rejection)
```

## Permission Matrix

| Action | Guest | User | Chapter Admin | Super Admin |
|--------|-------|------|---------------|-------------|
| View published | ✅ | ✅ | ✅ | ✅ |
| RSVP | ❌ | ✅ | ✅ | ✅ |
| Create | ❌ | ❌ | ✅ | ✅ |
| Approve | ❌ | ❌ | ❌ | ✅ |

## Key Business Rules

1. **Chapter Admin** events start as DRAFT (require approval)
2. **Super Admin** events auto-publish (skip approval)
3. Only **GOING** status counts toward capacity
4. **DRAFT/WAITING** events are hard-deleted
5. **PUBLISHED** events are soft-deleted (marked CANCELLED)
6. All RSVPd users notified on update/cancellation

## Files

```
src/
├── models/
│   ├── Event.ts (180 lines)
│   └── EventRSVP.ts (40 lines)
├── modules/events/
│   ├── events.controller.ts (350 lines)
│   └── events.routes.ts (450 lines)
└── services/
    └── event.service.ts (650 lines)
```

## Database Indexes

- `(chapterId, startDate)`
- `(chapterId, status, startDate)`
- `(startDate, isPublished)`
- `(eventId, userId)` - unique (EventRSVP)

## Email Notifications

1. Event Approval Request → Super Admins
2. Event Approved → Organizer
3. Event Rejected → Organizer
4. Event Cancelled → All RSVPd users
5. Event Updated → All RSVPd users

## Testing Checklist

- [ ] Create event as Chapter Admin
- [ ] Create event as Super Admin
- [ ] Submit event for approval
- [ ] Approve event
- [ ] Reject event
- [ ] RSVP to event
- [ ] Update RSVP
- [ ] Cancel RSVP
- [ ] Update event (check notifications)
- [ ] Cancel event (check notifications)
- [ ] Export attendees (CSV/PDF)
- [ ] Test capacity limits
- [ ] Test visibility rules

## Common Issues

1. **Events not visible**: Check status and user role
2. **RSVP fails**: Check capacity and event status
3. **Permission denied**: Verify user role and chapter
4. **Email not sent**: Check email service configuration

## Related Documentation

- [Complete API Documentation](./README.md)
- [Email Service Documentation](../../EMAIL_MIGRATION_PLAN.md)
- [Admin Module Documentation](../admin/README.md)
- [Notification System](../notifications/README.md)

---

**For detailed documentation, see [README.md](./README.md)**
