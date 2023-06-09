import { PubSubEngine } from 'graphql-subscriptions';
import {
  Arg,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription,
} from 'type-graphql';
import { NotificationPayload, Notification } from '../types/notification.type';

@Resolver()
export class SampleResolver {
  private autoIncrement = 0;

  @Query(() => Date)
  currentDate() {
    return new Date();
  }

  @Mutation(() => Boolean)
  async pubSubMutation(
    @PubSub() pubSub: PubSubEngine,
    @Arg('message', () => String, { nullable: true }) message?: string
  ): Promise<boolean> {
    const payload: NotificationPayload = { id: ++this.autoIncrement, message };
    await pubSub.publish('NOTIFICATIONS', payload);
    return true;
  }

  @Mutation(() => Boolean)
  async publisherMutation(
    @PubSub('NOTIFICATIONS') publish: Publisher<NotificationPayload>,
    @Arg('message', () => String, { nullable: true }) message?: string
  ): Promise<boolean> {
    console.log('message');
    await publish({ id: ++this.autoIncrement, message });
    return true;
  }

  @Subscription(() => Notification, { topics: 'NOTIFICATIONS' })
  normalSubscription(
    @Root() { id, message }: NotificationPayload
  ): Notification {
    return { id, message, date: new Date() };
  }

  @Subscription((returns) => Notification, {
    topics: 'NOTIFICATIONS',
    filter: ({ payload }: ResolverFilterData<NotificationPayload>) =>
      payload.id % 2 === 0,
  })
  subscriptionWithFilter(@Root() { id, message }: NotificationPayload) {
    const newNotification: Notification = { id, message, date: new Date() };
    return newNotification;
  }

  // dynamic topic

  @Mutation((returns) => Boolean)
  async pubSubMutationToDynamicTopic(
    @PubSub() pubSub: PubSubEngine,
    @Arg('topic', () => String) topic: string,
    @Arg('message', () => String, { nullable: true }) message?: string
  ): Promise<boolean> {
    const payload: NotificationPayload = { id: ++this.autoIncrement, message };
    await pubSub.publish(topic, payload);
    return true;
  }

  @Subscription(() => Notification, {
    topics: ({ args }) => args.topic,
  })
  subscriptionWithFilterToDynamicTopic(
    @Arg('topic', () => String) topic: string,
    @Root() { id, message }: NotificationPayload
  ): Notification {
    return { id, message, date: new Date() };
  }
}
