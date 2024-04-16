import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { getCookie, setCookie } from 'hono/cookie';
import Mustache from 'mustache';
import { getRandomValuesInGroups } from 'random-division';
import { generateTeamName, importHtmlAsString } from './utils';

const indexHtml = await importHtmlAsString('./src/templates/index.html');
const memberListHtml = await importHtmlAsString('./src/templates/member-list.html');
const teamsHtml = await importHtmlAsString('./src/templates/teams.html');

const title = "Awesome Team Generator";

const getMemberList = (members: string[]) => {
    if (!members || members.length === 0) {
        return '';
    }
    return Mustache.render(memberListHtml, { members });
};

const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/', (c) => c.html(Mustache.render(indexHtml, {
    title,
    membersList: getMemberList(JSON.parse(getCookie(c).members || '[]'))
})));

app.post('/member/add', async (c) => {
    const data = await c.req.formData();
    const membersString = getCookie(c).members;
    try {
        const membersParsed = membersString ? JSON.parse(membersString) : [];
        let members = Array.isArray(membersParsed) ? membersParsed : [];
        const member = (data.get('member') as string || '').trim();
        if (member && members.indexOf(member) === -1) {
            members = [...members, member];
        }
        setCookie(c, 'members', JSON.stringify(members));

        return c.html(getMemberList(members));
    } catch (error) {
        console.error('Failed to parse members:', error);
        return c.text(`${error}`);
    }
});

app.delete('/member/delete/:member', async (c) => {
    const member = c.req.param('member');
    const membersString = getCookie(c).members;
    try {
        const membersParsed = membersString ? JSON.parse(membersString) : [];
        let members = Array.isArray(membersParsed) ? membersParsed : [];
        members = members.filter((m) => m !== member);
        setCookie(c, 'members', JSON.stringify(members));

        return c.html(getMemberList(members));
    } catch (error) {
        console.error('Failed to parse members:', error);
        return c.text(`${error}`);
    }
});

app.post('/team/divide', async (c) => {
    const membersString = getCookie(c).members;
    try {
        const numberOfTeams = (await c.req.formData()).get('nr-of-teams');
        const membersParsed = membersString ? JSON.parse(membersString) : [];
        let members = Array.isArray(membersParsed) ? membersParsed : [];
        const teams = getRandomValuesInGroups(members, members.length, numberOfTeams).map((team) => ({
            name: `${generateTeamName()}`,
            members: team,
        }));

        return c.html(Mustache.render(teamsHtml, { teams }));
    } catch (error) {
        console.error('Failed to parse members:', error);
        return c.text(`${error}`);
    }
});

export default app;
